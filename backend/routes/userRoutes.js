const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get NGO Dashboard Data
router.get("/ngo-dashboard", authMiddleware, (req, res) => {
  // For now, return mock data - can be connected to database later
  res.status(200).json({
    success: true,
    data: {
      organizationName: req.user.name || "WasteZero Partner NGO",
      email: req.user.email,
      location: "Kolkata, India",
      joinedDate: "Feb 2026",
      opportunities: [],
      stats: {
        totalOpportunities: 0,
        totalVolunteers: 0,
        totalImpact: 0,
      },
    },
  });
});

// Get Volunteer Dashboard Data
router.get("/volunteer-dashboard", authMiddleware, (req, res) => {
  // For now, return mock data - can be connected to database later
  res.status(200).json({
    success: true,
    data: {
      name: req.user.name,
      email: req.user.email,
      bio: req.user.bio || "",
      skills: req.user.skills || [],
      location: req.user.location || "",
      stats: {
        pickupsCompleted: 124,
        kgRecycled: 850,
        pendingRequests: 6,
        sustainabilityScore: 78,
      },
      upcomingDrives: [
        { id: 1, location: "Park Street", date: "18 Feb 2026" },
        { id: 2, location: "Eco Lake", date: "22 Feb 2026" },
        { id: 3, location: "City Market", date: "1 Mar 2026" },
      ],
      applications: [],
    },
  });
});

module.exports = router;
