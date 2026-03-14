const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// NGO only route
router.get(
  "/ngo-dashboard",
  authMiddleware,
  roleMiddleware("ngo"),
  (req, res) => {
    try {
      res.json({
        success: true,
        message: "Welcome NGO",
        user: req.user,
        dashboard: {
          name: req.user.name,
          role: req.user.role,
          email: req.user.email,
          skills: req.user.skills,
          location: req.user.location,
          bio: req.user.bio,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to load dashboard",
      });
    }
  },
);

// Volunteer dashboard
router.get(
  "/volunteer-dashboard",
  authMiddleware,
  roleMiddleware("volunteer"),
  async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Volunteer dashboard data fetched successfully",
        user: req.user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to load dashboard",
      });
    }
  },
);

router.put("/set-role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const normalizedRole = role.toLowerCase();

    if (!["volunteer", "ngo", "admin"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be volunteer, ngo, or admin",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = normalizedRole;
    await user.save();

    res.json({
      success: true,
      message: "Role updated successfully",
      role: user.role,
    });
  } catch (error) {
    console.error("Set role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
