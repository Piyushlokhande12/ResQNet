const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    incident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    type: {
      type: String,
      enum: ["sos_alert", "status_update", "responder_assigned", "resolved", "system"],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    channel: { type: String, enum: ["push", "sms", "email", "in_app"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);