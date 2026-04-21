const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getMyApplications,
  applyToOpportunity,
  getOpportunityApplicants,
  updateApplicationStatus,
} = require("../controllers/opportunityController");

// CREATE OPPORTUNITY (NGO only)
router.post("/", authMiddleware, roleMiddleware("ngo"), createOpportunity);

// NGO: VIEW THEIR OPPORTUNITIES
router.get("/my-opportunities", authMiddleware, roleMiddleware("ngo"), getMyOpportunities);

// VOLUNTEER: VIEW APPLICATIONS
router.get("/my-applications", authMiddleware, roleMiddleware("volunteer"), getMyApplications);

// VOLUNTEER APPLY
router.post("/:id/apply", authMiddleware, roleMiddleware("volunteer"), applyToOpportunity);

// NGO: VIEW APPLICANTS WITH SKILL MATCH
router.get("/:id/applicants", authMiddleware, roleMiddleware("ngo"), getOpportunityApplicants);

// NGO: ACCEPT / REJECT AN APPLICANT
// Must be defined before the generic /:id routes so it isn't swallowed by them
router.patch("/:id/applicants/:volunteerId/status", authMiddleware, roleMiddleware("ngo"), updateApplicationStatus);

// PUBLIC ROUTES
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);

// UPDATE OPPORTUNITY (NGO only)
router.put("/:id", authMiddleware, roleMiddleware("ngo"), updateOpportunity);

// DELETE OPPORTUNITY (NGO only)
router.delete("/:id", authMiddleware, roleMiddleware("ngo"), deleteOpportunity);

module.exports = router;