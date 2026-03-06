const express = require("express");
const router = express.Router();

const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getMyApplications,
  applyToOpportunity
} = require("../controllers/opportunityController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Create opportunity
router.post("/", authMiddleware, roleMiddleware("ngo"), createOpportunity);


// IMPORTANT: custom routes BEFORE :id
router.get("/my-opportunities", authMiddleware, getMyOpportunities);
router.get("/my-applications", authMiddleware, getMyApplications);


// Apply to opportunity
router.post(
  "/:id/apply",
  authMiddleware,
  roleMiddleware("volunteer"),
  applyToOpportunity
);


// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);


// Update opportunity
router.put("/:id", authMiddleware, roleMiddleware("ngo"), updateOpportunity);


// Delete opportunity
router.delete("/:id", authMiddleware, roleMiddleware("ngo"), deleteOpportunity);


module.exports = router;
