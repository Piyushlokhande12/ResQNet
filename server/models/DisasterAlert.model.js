const mongoose = require("mongoose");

const disasterAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["flood", "earthquake", "fire", "storm", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    affectedArea: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DisasterAlert", disasterAlertSchema);