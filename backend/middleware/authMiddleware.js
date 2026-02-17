const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
