const jwt = require("jsonwebtoken");
<<<<<<< HEAD

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
=======
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

<<<<<<< HEAD
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
=======
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
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
    });
  }
};

module.exports = authMiddleware;
