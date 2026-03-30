const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ================= CREATE =================
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredSkills, duration, location, status } =
      req.body;

    if (!title || !description || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      ngo: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      opportunity,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= GET ALL =================
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
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= GET ONE =================
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const opportunity = await Opportunity.findById(id)
      .populate("ngo", "name email role");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({
      success: true,
      opportunity,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= UPDATE =================
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (opportunity.ngo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    Object.assign(opportunity, req.body);
    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      opportunity,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= DELETE =================
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (opportunity.ngo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Opportunity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};