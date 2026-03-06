const express = require("express");
const router = express.Router();

const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getAllOpportunities,
  getAllOpportunitiesForNgo,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getMyApplications,
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

router.post("/", authMiddleware, createOpportunity);
router.get("/", authMiddleware, getMyOpportunities);
router.get("/all", getAllOpportunities);
// NGO can get all opportunities (both NGO and volunteer created)
router.get("/ngo/all", authMiddleware, roleMiddleware("ngo"), getAllOpportunitiesForNgo);
router.get("/my-applications", authMiddleware, getMyApplications);
router.put("/:id", authMiddleware, updateOpportunity);
router.delete("/:id", authMiddleware, deleteOpportunity);
router.post("/:id/apply", authMiddleware, applyToOpportunity);

module.exports = router;
