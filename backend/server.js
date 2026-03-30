const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

require("./config/passport");

const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

console.log("MONGO_URI:", process.env.MONGO_URI);

const server = http.createServer(app);

connectDB();

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    socket.join(userId); // ✅ THIS is what makes io.to(receiver_id) work
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

app.set("io", io);
app.set("users", users);

app.use(helmet());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});