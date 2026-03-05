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
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    duration: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // 🔐 NGO who created this opportunity
    createdBy: {
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);  

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
