const express = require("express");
const router = express.Router();
const {
  triggerSOS,
  getAllIncidents,
  getMyIncidents,
  getIncident,
  updateStatus,
  uploadEvidence,
  sendMessage,
  markFake,
  nearbyservice,
} = require("../controllers/incident.controller");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../services/cloudinary.service");
const { findNearbyServices } = require("../services/location.service");

// router.get("/nearby-services", protect, nearbyservice);
router.get("/nearby",protect,nearbyservice);

router.post("/sos", protect, triggerSOS);
router.get("/mine", protect, getMyIncidents);
router.get("/", protect, authorize("admin", "responder"), getAllIncidents);

router.get("/:id", protect, getIncident);
router.patch("/:id/status", protect, authorize("admin", "responder"), updateStatus);
router.post("/:id/evidence", protect, upload.single("file"), uploadEvidence);
router.post("/:id/message", protect, sendMessage);
router.patch("/:id/fake", protect, authorize("admin"), markFake);


module.exports = router;