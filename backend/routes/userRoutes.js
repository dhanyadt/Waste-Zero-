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
router.get("/ngo-dashboard", authMiddleware, roleMiddleware("NGO"), (req, res) => {
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
});

// Volunteer dashboard
router.get("/volunteer-dashboard",authMiddleware,roleMiddleware("volunteer"),async (req, res) => {
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
  }
);

router.put("/set-role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const normalizedRole = role.toLowerCase(); 

    if (!["volunteer", "ngo"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.user._id);
    user.role = normalizedRole;
    await user.save();

    res.json({ success: true, message: "Role updated", role: user.role });
  } catch (error) {
    console.error("Set role error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
