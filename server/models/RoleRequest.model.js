const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    responderType: {
      type: String,
      enum: ["police", "ambulance", "fire", "medical"],
      required: true,
    },
    badgeId:    { type: String, required: true },
    department: { type: String, required: true },
    reason:     { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote:    { type: String },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoleRequest", roleRequestSchema);