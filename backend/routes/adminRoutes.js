const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all admin routes
router.use(authMiddleware, roleMiddleware("admin"));

// Example admin route (test)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin route working",
  });
});

module.exports = router;