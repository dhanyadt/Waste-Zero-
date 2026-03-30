const mongoose = require("mongoose");
const User = require("../models/User");
const Opportunity = require("../models/Opportunity");
const AuditLog = require("../models/AuditLog");
const Message = require("../models/Message");

// Helper to check valid ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // Some users might have lowercase roles, so we should group by uppercase equivalents, or we can just fetch all and aggregate
    const roles = await User.aggregate([
      { $group: { _id: { $toUpper: "$role" }, count: { $sum: 1 } } },
    ]);

    let usersByRole = {
      VOLUNTEER: 0,
      NGO: 0,
      ADMIN: 0,
    };

    roles.forEach((r) => {
      const roleName = r._id;
      if (roleName === "VOLUNTEER") usersByRole.VOLUNTEER += r.count;
      else if (roleName === "NGO") usersByRole.NGO += r.count;
      else if (roleName === "ADMIN") usersByRole.ADMIN += r.count;
    });

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
        totalOpportunities,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) {
      // support both cases
      query.role = { $in: [role.toLowerCase(), role.toUpperCase()] };
    }
    if (status) {
      query.status = status.toUpperCase();
    }

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
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });

    if (!status || !["ACTIVE", "SUSPENDED"].includes(status.toUpperCase())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot suspend themselves" });
    }

    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.status = status.toUpperCase();
    await user.save();

    await AuditLog.create({
      adminId: req.user._id,
      action:
        status.toUpperCase() === "SUSPENDED"
          ? "USER_SUSPENDED"
          : "USER_ACTIVATED",
      targetType: "USER",
      targetId: user._id,
      user_id: user._id,
      details: `User status changed to ${user.status}`,
      metadata: { previousStatus: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE", newStatus: user.status },
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/opportunities
exports.getAllOpportunities = async (req, res) => {
  try {
    const { status, createdBy, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.status = status.toLowerCase();
    if (createdBy) {
      if (!isValidId(createdBy)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid createdBy ID" });
      }
      query.createdBy = createdBy;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(query)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: opportunities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all opportunities error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Opportunity ID" });

    const opportunity = await Opportunity.findById(id);
    if (!opportunity)
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found" });

    await Opportunity.findByIdAndDelete(id);

    await AuditLog.create({
      adminId: req.user._id,
      action: "OPPORTUNITY_DELETED",
      targetType: "OPPORTUNITY",
      targetId: opportunity._id,
      user_id: opportunity.createdBy,
      details: `Deleted opportunity: ${opportunity.title}`,
      metadata: { opportunityTitle: opportunity.title, deletedBy: req.user._id },
    });

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/reports
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start)) dateFilter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end)) {
          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter.createdAt.$lte = endOfDay;
        }
      }
    }

    // A. USER ACTIVITY STATS
    const usersStats = await User.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          roleCounts: [
            { $group: { _id: { $toLower: "$role" }, count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const stats = usersStats[0] || {};
    const formattedUserStats = {
      totalUsers: stats.totalUsers?.[0]?.count || 0,
      activeUsers: stats.statusCounts?.find(s => s._id === "ACTIVE")?.count || 0,
      suspendedUsers: stats.statusCounts?.find(s => s._id === "SUSPENDED")?.count || 0,
      roles: {
        volunteers: stats.roleCounts?.find(r => r._id === "volunteer")?.count || 0,
        ngo: stats.roleCounts?.find(r => r._id === "ngo")?.count || 0,
        admin: stats.roleCounts?.find(r => r._id === "admin")?.count || 0,
      }
    };

    // B. OPPORTUNITY STATS
    const opportunitiesStats = await Opportunity.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalOpportunities: [{ $count: "count" }],
          byLocation: [
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byNGO: [
            { $group: { _id: "$ngo", count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "ngoDetails" } },
            { $unwind: "$ngoDetails" },
            { $project: { name: "$ngoDetails.name", count: 1 } }
          ]
        }
      }
    ]);

    const opStats = opportunitiesStats[0] || {};
    const formattedOpportunityStats = {
      totalOpportunities: opStats.totalOpportunities?.[0]?.count || 0,
      opportunitiesByLocation: opStats.byLocation || [],
      opportunitiesByNGO: opStats.byNGO || []
    };

    // C. VOLUNTEER RESPONSE METRICS (Messages)
    const messagesStats = await Message.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalMessages: [{ $count: "count" }],
          messagesPerUser: [
            { $group: { _id: "$sender_id", count: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" },
            { $project: { name: "$userDetails.name", count: 1 } }
          ],
          topActiveVolunteers: [
            { $group: { _id: "$sender_id", count: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" },
            { $match: { "userDetails.role": "volunteer" } },
            { $project: { name: "$userDetails.name", count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const mgStats = messagesStats[0] || {};
    const formattedMessageStats = {
      totalMessages: mgStats.totalMessages?.[0]?.count || 0,
      messagesPerUser: mgStats.messagesPerUser || [],
      topActiveVolunteers: mgStats.topActiveVolunteers || [],
      averageResponseTime: "Basic calculation not available with current schema"
    };

    res.status(200).json({
      success: true,
      reports: {
        users: formattedUserStats,
        opportunities: formattedOpportunityStats,
        messages: formattedMessageStats
      }
    });

  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
