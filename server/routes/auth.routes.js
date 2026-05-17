const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;