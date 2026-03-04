const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin: true,
// CORS configuration to allow frontend requests
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Connect to database
connectDB();

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ── Centralized error handler (must be LAST) ──────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
