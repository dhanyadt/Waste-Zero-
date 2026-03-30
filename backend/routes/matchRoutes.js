const express = require("express");
const router = express.Router();

const {
  getMatches,
  getMatchedVolunteers,
} = require("../controllers/matchController");

const authMiddleware = require("../middleware/authMiddleware");

// Volunteer matches
router.get("/", authMiddleware, getMatches);

// NGO specific opportunity matches
router.get("/:opportunityId", authMiddleware, getMatchedVolunteers);

module.exports = router;