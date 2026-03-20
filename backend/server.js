const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("./config/passport");

const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const Notification = require("./models/Notification");

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket"], // ⭐ keep this
});

app.set("io", io);

// ================= MIDDLEWARE =================
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());

// ================= SECURITY =================
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ================= DATABASE =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ================= ERROR =================
app.use(errorHandler);

// ================= SOCKET AUTH =================
const jwt = require("jsonwebtoken");

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token || token === "undefined") {
      socket.user = { _id: "tempUser" };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    socket.user = { _id: "tempUser" };
    next();
  }
});

// ================= SOCKET CONNECTION =================
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.user._id);

  const userId = socket.user._id.toString();

  // store user
  onlineUsers.set(userId, socket.id);

  // join room
  socket.join(userId);

  // -------- SEND MESSAGE --------
  socket.on("sendMessage", async ({ receiverId, message }) => {
    console.log("🔥 sendMessage triggered");

    const receiverSocket = onlineUsers.get(receiverId);

    let notif = null;

    // save only if valid user
    if (receiverId !== "tempUser") {
      notif = await Notification.create({
        user: receiverId,
        type: "message",
        message: "New message received 💬",
      });

      console.log("📦 Notification saved:", notif._id);
    }

    // emit message
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", {
        senderId: userId,
        message,
      });

      if (notif) {
        io.to(receiverSocket).emit("notification", notif);
      }
    }
  });

  // -------- NEW MATCH --------
  socket.on("newMatch", async ({ receiverId, matchData }) => {
    const receiverSocket = onlineUsers.get(receiverId);

    let notif = null;

    if (receiverId !== "tempUser") {
      notif = await Notification.create({
        user: receiverId,
        type: "match",
        message: "You got selected 🎉",
      });

      console.log("📦 Match Notification saved:", notif._id);
    }

    if (receiverSocket) {
      io.to(receiverSocket).emit("newMatch", matchData);

      if (notif) {
        io.to(receiverSocket).emit("notification", notif);
      }
    }
  });

  // -------- DISCONNECT --------
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);
    onlineUsers.delete(userId);
  });
});

// ================= START =================
const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});