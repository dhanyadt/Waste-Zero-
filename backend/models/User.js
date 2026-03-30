const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: { type: String },

    password: { type: String },

    role: {
      type: String,
      enum: ["volunteer", "ngo", "admin"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePic: { type: String },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    }
  },
  { timestamps: true }
);

/* ================================
   🔥 INDEXES (MILESTONE 4)
