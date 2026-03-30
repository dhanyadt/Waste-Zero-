const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// Secure all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Step 5: Dashboard Overview
router.get("/overview", adminController.getDashboardOverview);

// Step 5.1: Reporting System
router.get("/reports", adminController.getReports);

// Step 6: User Management
router.get("/users", adminController.getAllUsers);

// Step 7: Update User Status
router.patch("/users/:id/status", adminController.updateUserStatus);

// Step 8: Opportunity Moderation
router.get("/opportunities", adminController.getAllOpportunities);

// Step 9: Delete Opportunity
router.delete("/opportunities/:id", adminController.deleteOpportunity);

module.exports = router;
