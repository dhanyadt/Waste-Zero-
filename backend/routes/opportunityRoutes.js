const express = require("express");
const router = express.Router();

const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ── GET /opportunities  — public, supports ?location=&skills=&status=
router.get("/", getAllOpportunities);

// ── GET /opportunities/:id  — public
router.get("/:id", getOpportunityById);

// ── POST /opportunities  — NGO only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ngo"),
  createOpportunity
);

// ── PUT /opportunities/:id  — NGO only + ownership checked in controller
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ngo"),
  updateOpportunity
);

// ── DELETE /opportunities/:id  — NGO only + ownership checked in controller
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ngo"),
  deleteOpportunity
);

module.exports = router;

