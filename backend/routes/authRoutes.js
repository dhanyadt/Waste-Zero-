const express = require("express");
const router = express.Router();
const passport = require("passport");
const generateToken = require("../utils/generateToken");



const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
} = require("../controllers/authController");



const authMiddleware = require("../middleware/authMiddleware");
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, getUserProfile);
router.put("/me", authMiddleware, updateUserProfile);

// Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);


// Step 2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  (req, res) => {

    const token = generateToken(req.user._id);

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePic: req.user.profilePic
      }
    });

  }
);


router.put("/change-password", authMiddleware, changePassword);




module.exports = router;
