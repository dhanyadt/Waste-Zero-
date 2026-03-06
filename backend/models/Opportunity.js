
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    type: String,
    trim: true,
  }],
  duration: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdByType: {
    type: String,
    enum: ["ngo", "volunteer"],
    required: true,
  },
  // Keep ngo for backward compatibility - will store creator's reference
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Opportunity", opportunitySchema);
