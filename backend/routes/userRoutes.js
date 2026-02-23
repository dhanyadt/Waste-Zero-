const express = require("express");
const router = express.Router();

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

module.exports = router;