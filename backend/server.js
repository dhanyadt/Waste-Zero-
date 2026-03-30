const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

require("./config/passport");

// Routes
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

/* ===============================
   DATABASE
================================ */
connectDB();

/* ===============================
   SOCKET.IO SETUP
================================ */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    socket.join(userId);
    console.log("User registered:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }
  });
});

// Make socket available globally
app.set("io", io);
app.set("users", users);

/* ===============================
   SECURITY
================================ */
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

/* ===============================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ===============================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});