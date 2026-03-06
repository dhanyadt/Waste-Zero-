const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

require("./config/passport");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});