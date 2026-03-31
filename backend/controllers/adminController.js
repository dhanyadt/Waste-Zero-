const mongoose = require("mongoose");
const User = require("../models/User");
const Opportunity = require("../models/Opportunity");
const AuditLog = require("../models/AuditLog");
const Message = require("../models/Message");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const getAdminId = (req) => req.user?._id || req.user?.id;

// ── GET /api/admin/overview ───────────────────────────────────
exports.getDashboardOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const roles = await User.aggregate([
      { $group: { _id: { $toLower: "$role" }, count: { $sum: 1 } } },
    ]);

    let usersByRole = { volunteer: 0, ngo: 0, admin: 0 };
    roles.forEach((r) => {
      if (r._id in usersByRole) usersByRole[r._id] = r.count;
    });

    const [activeNgos, activeVolunteers] = await Promise.all([
      User.countDocuments({ role: "ngo",       status: { $ne: "suspended" } }),
      User.countDocuments({ role: "volunteer", status: { $ne: "suspended" } }),
    ]);

    const totalOpportunities = await Opportunity.countDocuments();

    const recentActivities = await AuditLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const mostActiveNgoAgg = await Opportunity.aggregate([
      { $group: { _id: "$createdBy", opportunityCount: { $sum: 1 } } },
      { $sort: { opportunityCount: -1 } },
      { $limit: 1 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "ngoDetails" } },
      { $unwind: "$ngoDetails" },
      { $project: { _id: "$ngoDetails._id", name: "$ngoDetails.name", email: "$ngoDetails.email", location: "$ngoDetails.location", opportunityCount: 1 } },
    ]);

    const mostActiveVolunteerAgg = await Opportunity.aggregate([
      { $match: { "applicants.0": { $exists: true } } },
      { $unwind: "$applicants" },
      { $group: { _id: "$applicants.user", applicationCount: { $sum: 1 } } },
      { $sort: { applicationCount: -1 } },
      { $limit: 1 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "volunteerDetails" } },
      { $unwind: "$volunteerDetails" },
      { $project: { _id: "$volunteerDetails._id", name: "$volunteerDetails.name", email: "$volunteerDetails.email", location: "$volunteerDetails.location", applicationCount: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers, usersByRole, activeNgos, activeVolunteers,
        totalOpportunities, recentActivities,
        mostActiveNgo:       mostActiveNgoAgg[0]       || null,
        mostActiveVolunteer: mostActiveVolunteerAgg[0] || null,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, limit = 200 } = req.query;

    let query = {};
    if (role)   query.role   = role.toLowerCase();
    if (status) query.status = status.toLowerCase(); // ✅ always lowercase to match schema enum

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: 1, pages: 1 },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── PATCH /api/admin/users/:id/status ────────────────────────
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid User ID" });

    //  User schema enum is "active" | "suspended"
    const normalizedStatus = (status || "").toLowerCase().trim();
    if (!["active", "suspended"].includes(normalizedStatus))
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Must be "active" or "suspended"`,
      });

    const adminId = getAdminId(req);
    if (!adminId)
      return res.status(401).json({ success: false, message: "Admin ID not found in token" });

    if (id === adminId.toString())
      return res.status(400).json({ success: false, message: "Admin cannot suspend themselves" });

    
    const updateResult = await User.updateOne(
      { _id: id },
      { $set: { status: normalizedStatus } }
    );

    if (updateResult.matchedCount === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = await User.findById(id).select("-password");

    try {
      await AuditLog.create({
        adminId,
        action:     normalizedStatus === "suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
        targetType: "USER",
        targetId:   user._id,
        user_id:    user._id,
        details:    `User ${user.name} status changed to ${normalizedStatus}`,
        metadata:   { newStatus: normalizedStatus },
      });
    } catch (logErr) {
      console.warn("AuditLog write failed (non-fatal):", logErr.message);
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      data: { _id: user._id, name: user.name, email: user.email, status: user.status },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── GET /api/admin/opportunities ─────────────────────────────
exports.getAllOpportunities = async (req, res) => {
  try {
    const { status, createdBy, location, ngo, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status)   query.status   = status.toLowerCase();
    if (location) query.location = { $regex: location, $options: "i" };
    if (ngo)      query.ngo      = ngo;
    if (createdBy) {
      if (!isValidId(createdBy))
        return res.status(400).json({ success: false, message: "Invalid createdBy ID" });
      query.createdBy = createdBy;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(query)
      .populate("ngo",       "name email")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: opportunities,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error("Get all opportunities error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── DELETE /api/admin/opportunities/:id ──────────────────────
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid Opportunity ID" });

    const opportunity = await Opportunity.findById(id);
    if (!opportunity)
      return res.status(404).json({ success: false, message: "Opportunity not found" });

    await Opportunity.findByIdAndDelete(id);

    const adminId = getAdminId(req);
    try {
      await AuditLog.create({
        adminId,
        action:     "OPPORTUNITY_DELETED",
        targetType: "OPPORTUNITY",
        targetId:   opportunity._id,
        user_id:    opportunity.createdBy,
        details:    `Deleted opportunity: ${opportunity.title}`,
        metadata:   { opportunityTitle: opportunity.title, deletedBy: adminId },
      });
    } catch (logErr) {
      console.warn("AuditLog write failed (non-fatal):", logErr.message);
    }

    res.status(200).json({ success: true, message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── GET /api/admin/reports ────────────────────────────────────
exports.getAdminReports = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = {};
    if (date_from || date_to) {
      dateFilter.createdAt = {};
      if (date_from) dateFilter.createdAt.$gte = new Date(date_from);
      if (date_to) {
        const end = new Date(date_to);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const usersStats = await User.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalUsers:   [{ $count: "count" }],
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          roleCounts:   [{ $group: { _id: { $toLower: "$role" }, count: { $sum: 1 } } }],
        },
      },
    ]);

    const stats = usersStats[0] || {};
    const formattedUserStats = {
      totalUsers:     stats.totalUsers?.[0]?.count || 0,
      activeUsers:    stats.statusCounts?.find(s => s._id === "active")?.count    || 0,
      suspendedUsers: stats.statusCounts?.find(s => s._id === "suspended")?.count || 0,
      roles: {
        volunteers: stats.roleCounts?.find(r => r._id === "volunteer")?.count || 0,
        ngo:        stats.roleCounts?.find(r => r._id === "ngo")?.count        || 0,
        admin:      stats.roleCounts?.find(r => r._id === "admin")?.count      || 0,
      },
    };

    const opportunitiesStats = await Opportunity.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalOpportunities: [{ $count: "count" }],
          byLocation: [
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byNGO: [
  { $group: { _id: "$createdBy", count: { $sum: 1 } } },
  { $sort: { count: -1 } },   
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "ngoDetails" } },
  { $unwind: "$ngoDetails" },
  { $project: { name: "$ngoDetails.name", count: 1 } }
],
        },
      },
    ]);

    const opStats = opportunitiesStats[0] || {};

    const volunteerParticipation = await Opportunity.aggregate([
      { $match: { ...dateFilter, "applicants.0": { $exists: true } } },
      { $unwind: "$applicants" },
      { $group: { _id: "$applicants.user", applicationCount: { $sum: 1 } } },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
      { $unwind: "$userDetails" },
      { $project: { name: "$userDetails.name", count: "$applicationCount" } },
    ]);

    const messagesStats = await Message.aggregate([
      { $match: dateFilter },
      { $facet: { totalMessages: [{ $count: "count" }] } },
    ]);

    res.status(200).json({
      success: true,
      reports: {
        users: formattedUserStats,
        opportunities: {
          totalOpportunities:      opStats.totalOpportunities?.[0]?.count || 0,
          opportunitiesByLocation: opStats.byLocation || [],
          opportunitiesByNGO:      opStats.byNGO      || [],
        },
        messages: {
          totalMessages:       messagesStats[0]?.totalMessages?.[0]?.count || 0,
          topActiveVolunteers: volunteerParticipation,
        },
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── GET /api/admin/logs ───────────────────────────────────────
exports.getAdminLogs = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const logs  = await AuditLog.find()
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
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};