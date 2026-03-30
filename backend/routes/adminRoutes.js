const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// 🔒 Secure all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// 📊 Dashboard Overview
router.get("/overview", adminController.getDashboardOverview);

// 👥 User Management
router.get("/users", adminController.getAllUsers);

// 🔄 Update User Status
router.patch("/users/:id/status", adminController.updateUserStatus);

// 📋 Opportunity Moderation
router.get("/opportunities", adminController.getAllOpportunities);

// ❌ Delete Opportunity (Admin override)
router.delete("/opportunities/:id", adminController.deleteOpportunity);

module.exports = router;