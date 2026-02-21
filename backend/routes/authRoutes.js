const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  socialAuth,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authMiddleware, getUserProfile);
router.put("/me", authMiddleware, updateUserProfile);

// Mock social auth endpoints for development
router.get("/google", (req, res) => socialAuth({ ...req, params: { provider: "google" } }, res));
router.get("/facebook", (req, res) => socialAuth({ ...req, params: { provider: "facebook" } }, res));
router.get("/apple", (req, res) => socialAuth({ ...req, params: { provider: "apple" } }, res));

module.exports = router;
