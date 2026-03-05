const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");

/* Helper: validate ObjectId */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────
   CREATE OPPORTUNITY
   POST /opportunities
───────────────────────────── */
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location, status } =
      req.body;

    if (!title || !description || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, duration and location are required",
      });
    }

    const createdByType = req.user.role === "ngo" ? "ngo" : "volunteer";

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      createdBy: req.user._id,
      createdByType,
      ngo: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    console.error("Create Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   GET ALL OPPORTUNITIES
   GET /opportunities
───────────────────────────── */
exports.getAllOpportunities = async (req, res) => {
  try {
    const { location, skills, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status.toLowerCase();
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      filter.requiredSkills = { $in: skillsArray };
    }

    const opportunities = await Opportunity.find(filter)
      .populate("createdBy", "name email role")
      .populate("ngo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error("Get Opportunities Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   GET MY OPPORTUNITIES
───────────────────────────── */
exports.getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user._id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error("Get My Opportunities Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   GET OPPORTUNITY BY ID
───────────────────────────── */
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findById(id)
      .populate("createdBy", "name email role")
      .populate("ngo", "name email");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Get Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   UPDATE OPPORTUNITY
───────────────────────────── */
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, duration, location, status } =
      req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    let opportunity;

    if (req.user.role === "ngo") {
      opportunity = await Opportunity.findById(id);
    } else {
      opportunity = await Opportunity.findOne({
        _id: id,
        createdBy: req.user._id,
      });
    }

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.requiredSkills =
      requiredSkills || opportunity.requiredSkills;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.status = status || opportunity.status;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    console.error("Update Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   DELETE OPPORTUNITY
───────────────────────────── */
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const isCreator =
      opportunity.createdBy.toString() === req.user._id.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "You can only delete opportunities you created",
      });
    }

    await Opportunity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Delete Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   APPLY TO OPPORTUNITY
───────────────────────────── */
exports.applyToOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (opportunity.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This opportunity is not open for applications",
      });
    }

    const alreadyApplied = opportunity.applicants.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this opportunity",
      });
    }

    opportunity.applicants.push({
      user: userId,
      status: "pending",
    });

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Apply Opportunity Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ─────────────────────────────
   GET MY APPLICATIONS
───────────────────────────── */
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const opportunities = await Opportunity.find({
      "applicants.user": userId,
    })
      .populate("ngo", "name email")
      .populate("createdBy", "name email role");

    const applications = opportunities.map((opp) => {
      const application = opp.applicants.find(
        (app) => app.user.toString() === userId.toString()
      );

      return {
        _id: opp._id,
        title: opp.title,
        description: opp.description,
        location: opp.location,
        duration: opp.duration,
        status: opp.status,
        ngo: opp.ngo,
        createdBy: opp.createdBy,
        createdByType: opp.createdByType,
        applicationStatus: application.status,
        appliedAt: application.appliedAt,
      };
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};