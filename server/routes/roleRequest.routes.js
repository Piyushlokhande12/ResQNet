const express = require("express");
const router = express.Router();
const RoleRequest = require("../models/RoleRequest.model");
const Responder   = require("../models/Responder.model");
const User        = require("../models/User.model");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, async (req, res) => {
  try {
    const { responderType, badgeId, department, reason } = req.body;

    if (req.user.role === "responder" || req.user.role === "admin") {
      return res.status(400).json({ success: false, message: "You are already a responder or admin" });
    }
    const existing = await RoleRequest.findOne({ user: req.user.id, status: "pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a pending request" });
    }

    const request = await RoleRequest.create({
      user: req.user.id,
      responderType,
      badgeId,
      department,
      reason,
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const requests = await RoleRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await RoleRequest.find(filter)
      .populate("user", "name email phone role")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.patch("/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await RoleRequest.findById(req.params.id).populate("user");

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending")
      return res.status(400).json({ success: false, message: "Request already reviewed" });

    request.status     = "approved";
    request.adminNote  = adminNote || "Your application has been approved.";
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();
    await User.findByIdAndUpdate(request.user._id, { role: "responder" });

    const existingProfile = await Responder.findOne({ user: request.user._id });
    if (!existingProfile) {
      await Responder.create({
        user:          request.user._id,
        responderType: request.responderType,
        badgeId:       request.badgeId,
        department:    request.department,
      });
    }

    res.json({
      success: true,
      message: `${request.user.name} has been approved as a ${request.responderType} responder`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/reject", protect, authorize("admin"), async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await RoleRequest.findById(req.params.id).populate("user");

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending")
      return res.status(400).json({ success: false, message: "Request already reviewed" });

    request.status     = "rejected";
    request.adminNote  = adminNote || "Your application has been rejected.";
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Request rejected", request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/direct-role/:userId", protect, authorize("admin"), async (req, res) => {
  try {
    const { role, responderType, badgeId, department } = req.body;

    if (!["user", "responder", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

   if (role === "responder" && responderType && badgeId) {
      const existing = await Responder.findOne({ user: req.params.userId });
      if (!existing) {
        await Responder.create({
          user: req.params.userId,
          responderType,
          badgeId: badgeId || "DIRECT-001",
          department: department || "Direct Assignment",
        });
      }
    }

    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;