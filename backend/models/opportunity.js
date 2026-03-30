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
      trim: true,
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
      trim: true,
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
        name: {
          type: String,
          trim: true,
        },
        location: {
          type: String,
          trim: true,
        },
        skills: [
          {
            type: String,
            trim: true,
          },
        ],
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

/* ================================
   🔥 DATABASE INDEXES (M4 REQUIREMENT)
================================ */

// Search/filter indexes
opportunitySchema.index({ location: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ requiredSkills: 1 });

// Creator-based queries
opportunitySchema.index({ createdBy: 1 });
opportunitySchema.index({ ngo: 1 });

// Sorting
opportunitySchema.index({ createdAt: -1 });

// Compound indexes (important for real queries)
opportunitySchema.index({ status: 1, location: 1 });
opportunitySchema.index({ createdBy: 1, location: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);