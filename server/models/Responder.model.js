const mongoose = require("mongoose");

const responderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    responderType: {
      type: String,
      enum: ["police", "ambulance", "fire", "medical"],
      required: true,
    },

    badgeId: { type: String, required: true, unique: true },
    department: { type: String },

    isAvailable: { type: Boolean, default: true },
    isOnDuty: { type: Boolean, default: false },

    currentLocation: {
      type: { type: String, default: "Point" },
      coordinates: [Number], // [lng, lat]
    },

    activeIncident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },

    totalResolved: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // in minutes
  },
  { timestamps: true }
);

responderSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Responder", responderSchema);