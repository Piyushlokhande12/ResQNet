const Responder = require("../models/Responder.model");
const Incident = require("../models/Incident.model");
const { getIO } = require("../config/socket");

// ─── Register as responder ─────────────────────────────────────────────────────
exports.registerResponder = async (req, res) => {
  try {
    const { responderType, badgeId, department } = req.body;

    const existing = await Responder.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: "Already registered as responder" });

    const responder = await Responder.create({
      user: req.user.id,
      responderType,
      badgeId,
      department,
    });

    res.status(201).json({ success: true, responder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update responder location ─────────────────────────────────────────────────
exports.updateLocation = async (req, res) => {
  try {
    const { coordinates } = req.body; // [lng, lat]
    const responder = await Responder.findOneAndUpdate(
      { user: req.user.id },
      { currentLocation: { type: "Point", coordinates } },
      { new: true }
    );

    if (responder?.activeIncident) {
      const io = getIO();
      io.to(responder.activeIncident.toString()).emit("responder_location", { coordinates });
    }

    res.json({ success: true, responder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Accept incident ───────────────────────────────────────────────────────────
exports.acceptIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.incidentId);
    if (!incident) return res.status(404).json({ success: false, message: "Incident not found" });
    if (incident.status !== "pending")
      return res.status(400).json({ success: false, message: "Incident already handled" });

    incident.responder = req.user.id;
    incident.status = "accepted";
    incident.acceptedAt = new Date();
    await incident.save();

    await Responder.findOneAndUpdate(
      { user: req.user.id },
      { isAvailable: false, activeIncident: incident._id }
    );

    const io = getIO();
    io.to(incident._id.toString()).emit("incident_accepted", {
      responderId: req.user.id,
      responderName: req.user.name,
    });

    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get nearby responders ─────────────────────────────────────────────────────
exports.getNearbyResponders = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;

    const responders = await Responder.find({
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
      isAvailable: true,
    }).populate("user", "name phone");

    res.json({ success: true, responders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get responder dashboard stats ────────────────────────────────────────────
exports.getMyStats = async (req, res) => {
  try {
    const responder = await Responder.findOne({ user: req.user.id });
    const resolved = await Incident.countDocuments({ responder: req.user.id, status: "resolved" });
    const active = await Incident.countDocuments({ responder: req.user.id, status: { $in: ["accepted", "on_the_way"] } });

    res.json({ success: true, stats: { resolved, active, responder } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};