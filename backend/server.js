const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// CORS configuration to allow frontend requests
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());



// Connect to database (optional - works in demo mode without it)
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
