const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  metadata: {
    type: Object, // optional extra info
    default: {},
  },
});

// 🔥 INDEX (important for reports & sorting)
adminLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("AdminLog", adminLogSchema);