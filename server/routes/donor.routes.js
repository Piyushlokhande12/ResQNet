const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const { bloodGroup } = req.query;

    const filter = { role: "user", isBlocked: false };
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const donors = await User.find(filter)
      .select("name phone bloodGroup address")
      .limit(30);

    res.json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;