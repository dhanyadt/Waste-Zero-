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
} = require("../controllers/opportunityController");


// CREATE OPPORTUNITY (NGO only)
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


// GET ALL OPPORTUNITIES
router.get("/", getAllOpportunities);


// GET SINGLE OPPORTUNITY
router.get("/:id", getOpportunityById);


// UPDATE OPPORTUNITY
router.put("/:id", authMiddleware, updateOpportunity);


// DELETE OPPORTUNITY
router.delete("/:id", authMiddleware, deleteOpportunity);
// Public routes
router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);


// Update opportunity
router.put("/:id", authMiddleware, roleMiddleware("ngo"), updateOpportunity);


// Delete opportunity
router.delete("/:id", authMiddleware, roleMiddleware("ngo"), deleteOpportunity);



module.exports = router;