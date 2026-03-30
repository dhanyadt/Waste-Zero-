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

// CREATE (NGO only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ngo"),
  createOpportunity
);

// GET ALL
router.get("/", getAllOpportunities);

// GET SINGLE
router.get("/:id", getOpportunityById);

// UPDATE (owner only)
router.put("/:id", authMiddleware, updateOpportunity);

// DELETE (owner only)
router.delete("/:id", authMiddleware, deleteOpportunity);

module.exports = router;