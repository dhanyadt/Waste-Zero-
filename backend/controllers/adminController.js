const mongoose = require("mongoose");
const User = require("../models/User");
const Opportunity = require("../models/Opportunity");
const AuditLog = require("../models/AuditLog");

// Helper to check valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET /api/admin/overview ───────────────────────────────────
// main's version — richer (role breakdown, AuditLog activity)
exports.getDashboardOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const roles = await User.aggregate([
      { $group: { _id: { $toUpper: "$role" }, count: { $sum: 1 } } },
    ]);

    let usersByRole = { VOLUNTEER: 0, NGO: 0, ADMIN: 0 };
    roles.forEach((r) => {
      if (r._id === "VOLUNTEER") usersByRole.VOLUNTEER += r.count;
      else if (r._id === "NGO") usersByRole.NGO += r.count;
      else if (r._id === "ADMIN") usersByRole.ADMIN += r.count;
    });

    // stats: activeNgos, activeVolunteers
    const [activeNgos, activeVolunteers] = await Promise.all([
      User.countDocuments({ role: "ngo", status: "active" }),
      User.countDocuments({ role: "volunteer", status: "active" }),
    ]);

    const totalOpportunities = await Opportunity.countDocuments();

    const recentActivities = await AuditLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        usersByRole,
        activeNgos,
        activeVolunteers,
        totalOpportunities,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
// main's version — pagination + role/status filter
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) query.role = { $in: [role.toLowerCase(), role.toUpperCase()] };
    if (status) query.status = status.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PATCH /api/admin/users/:id/status ────────────────────────
// main's version — validation + AuditLog + self-suspend protection
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid User ID" });

    if (!status || !["ACTIVE", "SUSPENDED"].includes(status.toUpperCase()))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    if (id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "Admin cannot suspend themselves" });

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.status = status.toUpperCase();
    await user.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: status.toUpperCase() === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED",
      targetType: "USER",
      targetId: user._id,
      details: `User status changed to ${user.status}`,
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      data: { _id: user._id, name: user.name, email: user.email, status: user.status },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/admin/opportunities ──────────────────────────────
// merged 
exports.getAllOpportunities = async (req, res) => {
  try {
    const { status, createdBy, location, ngo, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.status = status.toLowerCase();
    if (location) query.location = { $regex: location, $options: "i" };
    if (ngo) query["ngo.name"] = { $regex: ngo, $options: "i" };
    if (createdBy) {
      if (!isValidId(createdBy))
        return res.status(400).json({ success: false, message: "Invalid createdBy ID" });
      query.createdBy = createdBy;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(query)
      .populate("ngo", "name email")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: opportunities,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get all opportunities error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/admin/opportunities/:id ───────────────────────
// main's version — validation + AuditLog
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid Opportunity ID" });

    const opportunity = await Opportunity.findById(id);
    if (!opportunity)
      return res.status(404).json({ success: false, message: "Opportunity not found" });

    await Opportunity.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: req.user._id,
      action: "OPPORTUNITY_DELETED",
      targetType: "OPPORTUNITY",
      targetId: opportunity._id,
      details: `Deleted opportunity: ${opportunity.title}`,
    });

    res.status(200).json({ success: true, message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/admin/reports ────────────────────────────────────

exports.getAdminReports = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const match = {};
    if (date_from) match.$gte = new Date(date_from);
    if (date_to) match.$lte = new Date(date_to + "T23:59:59.999Z");

    const userGrowth = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          count: 1, _id: 0,
        },
      },
    ]);

    const oppGrowth = await Opportunity.aggregate([
      { $match: { createdAt: match } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          count: 1, _id: 0,
        },
      },
    ]);

    const participation = await Opportunity.aggregate([
      { $match: { createdAt: match } },
      { $unwind: "$applicants" },
      {
        $group: {
          _id: { year: { $year: "$applicants.appliedAt" }, month: { $month: "$applicants.appliedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          count: 1, _id: 0,
        },
      },
    ]);

    res.status(200).json({ success: true, userGrowth, oppGrowth, participation });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/admin/logs ───────────────────────────────────────
// manisha's intent + main's AuditLog model (replaces hardcoded sample data)
exports.getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      logs,
      pagination: { current: page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};