const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

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

    // backward compatibility
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    applicants: [
      {
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
      },
    ],
  },
  { timestamps: true }
);

// 🔥 CLEAN INDEXES (NO DUPLICATES)
opportunitySchema.index({ ngo: 1 });
opportunitySchema.index({ location: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ requiredSkills: 1 });
opportunitySchema.index({ createdAt: -1 });

// 🔥 Optional advanced index (very good)
opportunitySchema.index({ status: 1, location: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);