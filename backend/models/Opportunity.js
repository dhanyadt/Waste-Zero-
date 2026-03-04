const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    required_skills: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
opportunitySchema.index({ ngo_id: 1 });
opportunitySchema.index({ location: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ status: 1, location: 1 });
opportunitySchema.index({ required_skills: 1 });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

module.exports = Opportunity;
