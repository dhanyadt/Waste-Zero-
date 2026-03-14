const Message = require("../models/Message");

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

    const message = await Message.create({
      sender_id: req.user._id,
      receiver_id,
      content,
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
    })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};