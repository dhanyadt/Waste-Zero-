const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/* ================================
   RATE LIMITERS (MILESTONE 4)
================================ */

// General admin API limit — 100 requests per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for sensitive write actions — 20 per 15 minutes
const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many write actions, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================================
   MASS DELETION GUARD (MILESTONE 4)
   Prevents deleting more than 10 opportunities
   within a 1-minute window per admin
================================ */
const deletionTracker = {};

const massDeletionGuard = (req, res, next) => {
  const adminId = req.user?._id?.toString() || req.user?.id?.toString();
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxDeletions = 10;

  if (!deletionTracker[adminId]) {
    deletionTracker[adminId] = [];
  }

  // Remove timestamps outside the window
  deletionTracker[adminId] = deletionTracker[adminId].filter(
    (t) => now - t < windowMs
  );

  if (deletionTracker[adminId].length >= maxDeletions) {
    return res.status(429).json({
      success: false,
      message: `Mass deletion prevented. You can delete at most ${maxDeletions} opportunities per minute.`,
    });
  }

  deletionTracker[adminId].push(now);
  next();
};

// Protect all routes — auth + admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// Apply general rate limiter to all admin routes
router.use(adminLimiter);

// Dashboard
router.get("/overview", adminController.getDashboardOverview);

// Users
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/status", adminWriteLimiter, adminController.updateUserStatus);

// Opportunities
router.get("/opportunities", adminController.getAllOpportunities);
router.delete("/opportunities/:id", adminWriteLimiter, massDeletionGuard, adminController.deleteOpportunity);

// Reports
router.get("/reports", adminController.getAdminReports);

// Logs
router.get("/logs", adminController.getAdminLogs);

module.exports = router;