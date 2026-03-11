const express = require("express");
const router = express.Router();

const { sendMessage, getMessages } = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

// Send message
router.post("/", authMiddleware, sendMessage);

// Get conversation
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;