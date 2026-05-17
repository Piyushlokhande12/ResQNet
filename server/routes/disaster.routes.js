const express = require("express");
const router = express.Router();
const DisasterAlert = require("../models/DisasterAlert.model");
const { protect, authorize } = require("../middleware/auth");
const { getIO } = require("../config/socket");

router.get("/", protect, async (req, res) => {
  try {
    const alerts = await DisasterAlert.find({ isActive: true })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { title, message, type, severity, affectedArea } = req.body;

    const alert = await DisasterAlert.create({
      title, message, type, severity, affectedArea,
      createdBy: req.user.id,
    });

    const io = getIO();
    io.emit("disaster_alert", {
      id: alert._id,
      title,
      message,
      type,
      severity,
      affectedArea,
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/deactivate", protect, authorize("admin"), async (req, res) => {
  try {
    const alert = await DisasterAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;