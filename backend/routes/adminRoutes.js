const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  getAdminUsers,
  toggleUserStatus,
  getAdminOpportunities,
  deleteAdminOpportunity,
  getAdminReports,
  getAdminLogs
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// @desc  Admin overview dashboard stats
router.get('/overview', getAdminOverview);

// @desc  Get all users
router.get('/users', getAdminUsers);

// @desc  Toggle user status
router.patch('/users/:id/status', toggleUserStatus);

// @desc  Get all opportunities
router.get('/opportunities', getAdminOpportunities);

// @desc  Delete opportunity
router.delete('/opportunities/:id', deleteAdminOpportunity);

// @desc  Get reports and charts
router.get('/reports', getAdminReports);

// @desc  Get system logs/activity
router.get('/logs', getAdminLogs);

module.exports = router;

