const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── CORS Configuration (allow frontend requests) ─────────────
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());

// ── Connect to Database ──────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));

// ── Root Route ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ── Error Handler (must be LAST middleware) ──────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
