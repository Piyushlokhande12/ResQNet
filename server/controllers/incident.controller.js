const Incident = require("../models/Incident.model");
const User = require("../models/User.model");
const Notification = require("../models/Notification.model");
const { getIO } = require("../config/socket");

const {
  sendSOSEmailToAll
} = require("../services/email.service");

const {
  reverseGeocode,
  findNearbyServices
} = require("../services/location.service");

const {
  uploadToCloudinary
} = require("../services/cloudinary.service");


// ─── Trigger SOS ─────────────────────────────────────────────
exports.triggerSOS = async (req, res) => {
  try {
    const {
      emergencyType,
      coordinates,
      description,
      triggerMethod
    } = req.body;

    const [lng, lat] = coordinates;

    const address = await reverseGeocode(lat, lng);

    const incident = await Incident.create({
      user: req.user.id,
      emergencyType,
      description,
      triggerMethod: triggerMethod || "button",
      location: {
        type: "Point",
        coordinates: [lng, lat],
        address
      }
    });

    const user = await User.findById(req.user.id);

    // Send email to all emergency contacts
    if (user.emergencyContacts?.length > 0) {
      sendSOSEmailToAll(
        user.emergencyContacts,
        user.name,
        incident.location,
        emergencyType
      ).catch(console.error);
    }

    const io = getIO();

    io.emit("new_sos", {
      incidentId: incident._id,
      emergencyType,
      location: incident.location,
      userName: user.name,
      userPhone: user.phone
    });

    await Notification.create({
      recipient: req.user.id,
      incident: incident._id,
      type: "sos_alert",
      title: "SOS Triggered",
      body:
        "Your SOS has been sent. Emergency contacts have been notified.",
      channel: "in_app"
    });

    res.status(201).json({
      success: true,
      incident
    });

  } catch (error) {
    console.error("triggerSOS error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Get All Incidents ─────────────────────────────────────
exports.getAllIncidents = async (req, res) => {
  try {
    const {
      status,
      type,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.emergencyType = type;

    const incidents = await Incident.find(filter)
      .populate("user", "name phone bloodGroup medicalConditions")
      .populate("responder", "name phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Incident.countDocuments(filter);

    res.json({
      success: true,
      incidents,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Get My Incidents ──────────────────────────────────────
exports.getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      user: req.user.id
    })
      .populate("responder", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      incidents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Get Single Incident ───────────────────────────────────
exports.getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate(
        "user",
        "name phone bloodGroup medicalConditions allergies emergencyContacts"
      )
      .populate("responder", "name phone");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    res.json({
      success: true,
      incident
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Update Status ─────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    incident.status = status;

    if (status === "accepted") {
      incident.acceptedAt = new Date();
    }

    if (status === "resolved") {
      incident.resolvedAt = new Date();
    }

    await incident.save();

    const io = getIO();

    io.to(incident._id.toString()).emit("status_changed", {
      status
    });

    await Notification.create({
      recipient: incident.user,
      incident: incident._id,
      type: "status_update",
      title: "Incident Status Updated",
      body: `Your emergency status is now: ${status
        .replace("_", " ")
        .toUpperCase()}`,
      channel: "in_app"
    });

    res.json({
      success: true,
      incident
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Upload Evidence ───────────────────────────────────────
exports.uploadEvidence = async (req, res) => {
  try {
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "evidence"
    );

    console.log("Cloudinary upload result:", result);

    const mediaType = req.file.mimetype.startsWith("video")
      ? "video"
      : req.file.mimetype.startsWith("audio")
      ? "audio"
      : "image";

    incident.media.push({
      url: result.secure_url,
      type: mediaType,
      publicId: result.public_id
    });

    await incident.save();

    res.json({
      success: true,
      media: incident.media
    });

  } catch (error) {
    console.error("uploadEvidence error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Send Chat Message ─────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    const message = {
      sender: req.user.id,
      senderName: req.user.name,
      text,
      timestamp: new Date()
    };

    incident.messages.push(message);

    await incident.save();

    const io = getIO();

    io.to(incident._id.toString()).emit(
      "receive_message",
      message
    );

    res.json({
      success: true,
      message
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Mark Fake Alert ───────────────────────────────────────
exports.markFake = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    incident.status = "fake";
    incident.isFake = true;

    await incident.save();

    await User.findByIdAndUpdate(
      incident.user,
      {
        $inc: {
          fakeAlertCount: 1
        }
      }
    );

    res.json({
      success: true,
      message: "Marked as fake alert"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─── Nearby Services ───────────────────────────────────────
exports.nearbyservice = async (req, res) => {
  try {
    const { lat, lng, type = "hospital" } = req.query;

    console.log("Nearby service API called");

    console.log({
      lat,
      lng,
      type
    });

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const services = await findNearbyServices(
      Number(lat),
      Number(lng),
      type
    );

    res.json({
      success: true,
      count: services.length,
      services
    });

  } catch (error) {
    console.error("Nearby service error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};