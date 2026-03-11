// backend/middleware/roleMiddleware.js
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userRole = String(req.user.role).toLowerCase();
    const roles = allowedRoles.map(r => String(r).toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;