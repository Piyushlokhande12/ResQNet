const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  type: { type: String, default: "Point" },
  coordinates: { type: [Number], required: true }, // [lng, lat]
  address: String,
});

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
  }
);

const incidentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    emergencyType: {
      type: String,
      enum: [
        "medical",
        "accident",
        "fire",
        "crime",
        "women_safety",
        "natural_disaster",
        "other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "resolved", "cancelled", "fake"],
      default: "pending",
    },

    location: { type: locationSchema, required: true },

    description: { type: String },

    // Assigned responder
    responder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    responderLocation: locationSchema,

    // Media evidence
    media: [
      {
        url: String,
        type: { type: String, enum: ["image", "video", "audio"] },
        publicId: String,
      },
    ],

    // Chat messages
    messages: [messageSchema],

    // Timestamps for response tracking
    acceptedAt: Date,
    resolvedAt: Date,

    // SOS trigger method
    triggerMethod: {
      type: String,
      enum: ["button", "shake", "voice", "auto"],
      default: "button",
    },

    isFake: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Geo index for nearby queries
incidentSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Incident", incidentSchema);