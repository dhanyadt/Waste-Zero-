const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: false,
    },

    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ["volunteer", "ngo", "admin"],
      default: null,
      required: false,
    },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
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
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
