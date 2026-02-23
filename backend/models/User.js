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

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["volunteer", "NGO"],
      required: true,
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
<<<<<<< HEAD

    isVerified: {
      type: Boolean,
      default: false,
=======
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePic: {
      type: String,
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
