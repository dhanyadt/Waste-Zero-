const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("./config/passport");

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: "Too many requests, please try again later."
});
app.use(limiter);

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Body parser
app.use(express.json());

// Connect database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Error handler
require("./config/passport");
const app = express();

// ── CORS Configuration (allow frontend requests) ─────────────
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(passport.initialize());

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
});
