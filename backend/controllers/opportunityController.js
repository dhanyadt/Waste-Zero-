const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");

/* Helper to validate ObjectId */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────
   CREATE OPPORTUNITY
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

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      createdBy: req.user._id,
      createdByType: req.user.role,
      ngo: req.user._id, // backward compatibility
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      opportunity,
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
───────────────────────────── */
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("ngo", "name email role")
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

    const opportunity = await Opportunity.findById(id).populate(
      "ngo",
      "name email role"
    );

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

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    // 🔥 Only owner can update
    const opportunity = await Opportunity.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found or unauthorized",
      });
    }

    const { title, description, requiredSkills, duration, location, status } =
      req.body;

    if (title) opportunity.title = title;
    if (description) opportunity.description = description;
    if (requiredSkills) opportunity.requiredSkills = requiredSkills;
    if (duration) opportunity.duration = duration;
    if (location) opportunity.location = location;
    if (status) opportunity.status = status;

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

    // 🔥 Only owner can delete
    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this opportunity",
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