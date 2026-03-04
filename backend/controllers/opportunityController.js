const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

/* ── Helper: validate ObjectId ───────────────────────────────── */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ──────────────────────────────────────────────────────────────
   CREATE  POST /opportunities
   Only NGO role (enforced by roleMiddleware before this)
────────────────────────────────────────────────────────────── */
const createOpportunity = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, duration, location, status } = req.body;

    if (!title || !description || !duration || !location) {
      throw new ApiError(
        "title, description, duration and location are required",
        400
      );
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      requiredSkills: requiredSkills || [],
      duration,
      location,
      status: status || "open",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   GET ALL  GET /opportunities
   Public or authenticated. Supports filters
────────────────────────────────────────────────────────────── */
const getAllOpportunities = async (req, res, next) => {
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
      .populate("createdBy", "name location email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   GET ONE  GET /opportunities/:id
────────────────────────────────────────────────────────────── */
const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      throw new ApiError("Invalid opportunity ID", 400);
    }

    const opportunity = await Opportunity.findById(id)
      .populate("createdBy", "name location email bio");

    if (!opportunity) {
      throw new ApiError("Opportunity not found", 404);
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   UPDATE  PUT /opportunities/:id
   Only owner NGO can update
────────────────────────────────────────────────────────────── */
const updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      throw new ApiError("Invalid opportunity ID", 400);
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      throw new ApiError("Opportunity not found", 404);
    }

    // Ownership check
    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(
        "Forbidden: You can only edit your own opportunities",
        403
      );
    }

    const { title, description, requiredSkills, duration, location, status } = req.body;

    const allowedUpdates = {};
    if (title) allowedUpdates.title = title;
    if (description) allowedUpdates.description = description;
    if (requiredSkills) allowedUpdates.requiredSkills = requiredSkills;
    if (duration) allowedUpdates.duration = duration;
    if (location) allowedUpdates.location = location;
    if (status) allowedUpdates.status = status;

    const updated = await Opportunity.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate("createdBy", "name location email");

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────────────────────
   DELETE  DELETE /opportunities/:id
   Only owner NGO can delete
────────────────────────────────────────────────────────────── */
const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      throw new ApiError("Invalid opportunity ID", 400);
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      throw new ApiError("Opportunity not found", 404);
    }

    // Ownership check
    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(
        "Forbidden: You can only delete your own opportunities",
        403
      );
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};
