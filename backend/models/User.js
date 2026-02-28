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
      enum: ["volunteer", "ngo", "NGO", "admin"],
      default: null,
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
