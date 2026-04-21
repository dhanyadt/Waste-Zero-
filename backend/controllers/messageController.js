const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { calculateMatchScore } = require("../utils/matchUtils");

/* ─────────────────────────────
   SEND MESSAGE
   POST /messages
───────────────────────────── */

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message content required",
      });
    }

    // CHECK MATCH BEFORE SENDING
    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiver_id);

    if (!sender || !receiver) {
       return res.status(404).json({ success: false, message: "User not found" });
    }

    const message = await Message.create({
      sender_id: req.user._id,
      receiver_id,
      content,
    });

    // Save notification locally before sending
    await Notification.create({
      user: receiver_id,
      type: "message",
      message: "You have a new message",
    });

    // SOCKET EMIT (REAL-TIME MESSAGE)
    const io = req.app.get("io");

    // Secure targeted emit to recipient's room
    io.to(receiver_id.toString()).emit("newMessage", {
      _id: message._id,
      sender_id: req.user._id,
      receiver_id: receiver_id,
      content: message.content,
      createdAt: message.createdAt,
      read: false,
    });

    // OPTIONAL NOTIFICATION EVENT
    io.to(receiver_id.toString()).emit("newNotification", {
      type: "message",
      senderId: req.user._id,
      message: "New message received",
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message,
    });

  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ─────────────────────────────
   GET MESSAGE HISTORY
   GET /messages/:userId
───────────────────────────── */

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender_id: req.user._id, receiver_id: userId },
        { sender_id: userId, receiver_id: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    // Mark unread messages as read if receiver is current user
    const unreadIds = messages
      .filter(m => !m.read && String(m.receiver_id) === String(req.user._id))
      .map(m => m._id);

    if (unreadIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { read: true } }
      );
      messages.forEach(m => {
        if (unreadIds.includes(m._id)) m.read = true;
      });
    }

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ─────────────────────────────
   GET CONVERSATIONS
   GET /messages
───────────────────────────── */

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender_id", "name")
      .populate("receiver_id", "name");

    const conversationsMap = {};

    messages.forEach((msg) => {
      const otherUser =
        msg.sender_id._id.toString() === userId.toString()
          ? msg.receiver_id
          : msg.sender_id;

      if (!conversationsMap[otherUser._id]) {
        conversationsMap[otherUser._id] = {
          user: otherUser,
          lastMessage: msg.content,
          createdAt: msg.createdAt,
        };
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversationsMap),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


/* ─────────────────────────────
   CLEAR CHAT
   DELETE /messages/:userId
───────────────────────────── */

exports.clearChat = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.deleteMany({
      $or: [
        { sender_id: req.user._id, receiver_id: userId },
        { sender_id: userId, receiver_id: req.user._id },
      ],
    });

    res.status(200).json({ success: true, message: "Chat cleared" });
  } catch (error) {
    console.error("Clear Chat Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};