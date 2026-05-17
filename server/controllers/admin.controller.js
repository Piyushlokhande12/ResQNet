const User = require("../models/User.model");
const Incident = require("../models/Incident.model");
const Responder = require("../models/Responder.model");

// ─── Dashboard analytics ───────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalIncidents, pendingIncidents, resolvedIncidents, totalResponders] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Incident.countDocuments(),
        Incident.countDocuments({ status: "pending" }),
        Incident.countDocuments({ status: "resolved" }),
        Responder.countDocuments(),
      ]);

    // Emergency type breakdown
    const typeBreakdown = await Incident.aggregate([
      { $group: { _id: "$emergencyType", count: { $sum: 1 } } },
    ]);

    // Recent incidents
    const recentIncidents = await Incident.find()
      .populate("user", "name phone")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalIncidents,
        pendingIncidents,
        resolvedIncidents,
        totalResponders,
        typeBreakdown,
        recentIncidents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all users ─────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: /search/i }, { email: /search/i }];

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Block / Unblock user ──────────────────────────────────────────────────────
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Change user role ──────────────────────────────────────────────────────────
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get analytics (by date range) ────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const filter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const incidentsByDay = await Incident.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const avgResolutionTime = await Incident.aggregate([
      { $match: { ...filter, status: "resolved", resolvedAt: { $exists: true } } },
      {
        $project: {
          duration: { $divide: [{ $subtract: ["$resolvedAt", "$acceptedAt"] }, 60000] }, // mins
        },
      },
      { $group: { _id: null, avg: { $avg: "$duration" } } },
    ]);

    res.json({
      success: true,
      analytics: {
        incidentsByDay,
        avgResolutionTimeMinutes: avgResolutionTime[0]?.avg?.toFixed(1) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};