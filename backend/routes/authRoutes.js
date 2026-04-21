const express = require("express");
const router = express.Router();
// const passport = require("passport");
const generateToken = require("../utils/generateToken");

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Normal Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, getUserProfile);
router.put("/me", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);

// ================= GOOGLE AUTH =================

/* Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Step 2: Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const requireRole = !req.user.role;

    const userData = encodeURIComponent(
      JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic,
        role: req.user.role || null,
      }),
    );

    res.redirect(
      `http://localhost:5173/auth/callback?token=${token}&requireRole=${requireRole}&user=${userData}`,
    );
  },
);  */

module.exports = router;
