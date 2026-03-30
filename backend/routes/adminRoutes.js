const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all routes
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// Dashboard
router.get("/overview", adminController.getDashboardOverview);

// Users
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);

// Opportunities
router.get("/opportunities", adminController.getAllOpportunities);
router.delete("/opportunities/:id", adminController.deleteOpportunity);

// Reports
router.get("/reports", adminController.getAdminReports);

// Logs
router.get("/logs", adminController.getAdminLogs);

module.exports = router;