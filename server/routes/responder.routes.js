const express = require("express");
const router = express.Router();
const {
  registerResponder,
  updateLocation,
  acceptIncident,
  getNearbyResponders,
  getMyStats,
} = require("../controllers/responder.controller");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", protect, registerResponder);
router.put("/location", protect, updateLocation);
router.post("/accept/:incidentId", protect, authorize("responder", "admin"), acceptIncident);
router.get("/nearby", protect, getNearbyResponders);
router.get("/stats", protect, authorize("responder", "admin"), getMyStats);

module.exports = router;