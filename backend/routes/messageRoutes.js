const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  getConversations,
  clearChat,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ IMPORTANT: "/" MUST COME BEFORE "/:userId"
router.post("/", authMiddleware, sendMessage);

// ✅ conversations list
router.get("/", authMiddleware, getConversations);

// ✅ chat between two users
router.get("/:userId", authMiddleware, getMessages);

// ✅ clear chat with a user
router.delete("/:userId", authMiddleware, clearChat);

module.exports = router;