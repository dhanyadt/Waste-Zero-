const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

// @desc    Get admin overview stats
// @route   GET /api/admin/overview
// @access  Private/Admin
const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalNgos,
      totalVolunteers,
      totalOpportunities,
      activeNgos,
      activeVolunteers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Opportunity.countDocuments(),
      User.countDocuments({ role: 'ngo', status: 'active' }),
      User.countDocuments({ role: 'volunteer', status: 'active' })
    ]);

    const stats = {
      totalUsers,
      ngos: totalNgos,
      volunteers: totalVolunteers,
      totalOpportunities,
      activeNgos,
      activeVolunteers,
      recentActivity: [] // TODO: implement from logs model if exists
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name role status location email createdAt profilePic')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active/suspended)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin opportunities with filters
// @route   GET /api/admin/opportunities
// @access  Private/Admin
const getAdminOpportunities = async (req, res, next) => {
  try {
    const { status, ngo, location } = req.query;
    const filter = {};

    if (status && ['open', 'closed'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (ngo) {
      filter['ngo.name'] = { $regex: ngo, $options: 'i' }; // Assumes populated, but use aggregation or populate after
    }

    const opportunities = await Opportunity.find(filter)
      .populate('ngo', 'name email')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      opportunities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports/chart data with date range
// @route   GET /api/admin/reports
// @access  Private/Admin
const getAdminReports = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;
    const match = {};
    if (date_from) match.$gte = new Date(date_from);
    if (date_to) match.$lte = new Date(date_to + 'T23:59:59.999Z');

    // User growth: monthly new users
    const userGrowth = await User.aggregate([
      { $match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: { $concat: [ 
            { $toString: '$_id.month' },
            '-',
            { $toString: '$_id.year' }
          ] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Opportunity trends: monthly opps
    const oppGrowth = await Opportunity.aggregate([
      { $match: { createdAt: match } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: { $concat: [ 
            { $toString: '$_id.month' },
            '-',
            { $toString: '$_id.year' }
          ] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Participation: monthly applicants
    const participation = await Opportunity.aggregate([
      { $match: { createdAt: match } },
      { $unwind: '$applicants' },
      {
        $group: {
          _id: {
            year: { $year: '$applicants.appliedAt' },
            month: { $month: '$applicants.appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: { $concat: [ 
            { $toString: '$_id.month' },
            '-',
            { $toString: '$_id.year' }
          ] },
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      userGrowth,
      oppGrowth,
      participation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin activity logs with pagination
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAdminLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sample admin actions data (TODO: implement Log model + middleware logging)
    const sampleLogs = [
      { _id: 1, action: 'user_suspended', admin: 'Admin Smith', target: {type: 'user', id: 'user123', name: 'John Volunteer'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { _id: 2, action: 'opportunity_deleted', admin: 'Admin Smith', target: {type: 'opportunity', id: 'opp456', title: 'Beach Cleanup'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { _id: 3, action: 'user_activated', admin: 'Admin Johnson', target: {type: 'user', id: 'user789', name: 'Jane NGO'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) },
      { _id: 4, action: 'opportunity_deleted', admin: 'Admin Johnson', target: {type: 'opportunity', id: 'opp101', title: 'Park Clean-up'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15) },
      { _id: 5, action: 'user_suspended', admin: 'Admin Smith', target: {type: 'user', id: 'user222', name: 'Bob Volunteer'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20) },
      { _id: 6, action: 'opportunity_deleted', admin: 'Admin Lee', target: {type: 'opportunity', id: 'opp333', title: 'River Cleanup'}, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) }
    ].reverse(); // Recent first

    const logs = sampleLogs.slice(skip, skip + limit);
    const total = sampleLogs.length;

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity (admin moderation)
// @route   DELETE /api/admin/opportunities/:id
// @access  Private/Admin
const deleteAdminOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
  getAdminUsers,
  toggleUserStatus,
  getAdminOpportunities,
  deleteAdminOpportunity,
  getAdminReports,
  getAdminLogs
};

