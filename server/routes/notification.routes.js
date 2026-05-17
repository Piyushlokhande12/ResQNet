const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification.model");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.patch("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;