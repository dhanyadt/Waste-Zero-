const Opportunity = require("../models/Opportunity");
const User = require("../models/User");
const { calculateMatchScore } = require("../utils/matchUtils");

/* ─────────────────────────────
   GET MATCHES FOR VOLUNTEER
   GET /matches
───────────────────────────── */

exports.getMatches = async (req, res) => {
  try {
    const volunteer = await User.findById(req.user._id);

    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can view matches",
      });
    }

    const opportunities = await Opportunity.find({ status: "open" })
      .populate("createdBy", "name email");

    const matched = opportunities
      .map((opp) => {
        const result = calculateMatchScore(volunteer, opp);

        return {
          opportunity: opp,
          matchScore: result.score,
          matchingSkills: result.matchingSkills,
        };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // ❌ REMOVE SOCKET EMITS FROM GET API

    res.status(200).json({
      success: true,
      matches: matched,
    });

  } catch (error) {
    console.error("Get Matches Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ─────────────────────────────
   GET MATCHED VOLUNTEERS FOR NGO
   GET /matches/:opportunityId
───────────────────────────── */

exports.getMatchedVolunteers = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (opportunity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const volunteers = await User.find({ role: "volunteer" });

    const matched = volunteers
      .map((vol) => {
        const result = calculateMatchScore(vol, opportunity);

        return {
          volunteer: {
            _id: vol._id,
            name: vol.name,
            skills: vol.skills,
            location: vol.location,
          },
          matchScore: result.score,
          matchingSkills: result.matchingSkills,
        };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // ❌ REMOVE SOCKET EMITS FROM GET API

    res.status(200).json({
      success: true,
      matches: matched,
    });

  } catch (error) {
    console.error("Get Matched Volunteers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};