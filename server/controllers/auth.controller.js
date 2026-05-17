const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.model");
const { sendOTPEmail } = require("../services/email.service");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email,
      phone,
      password,
      otp,
      otpExpire,
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      success: true,
      message: "Registered! Check your email for OTP verification.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: "Email verified!", token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(401).json({ success: false, message: "Please verify your email first" });

    if (user.isBlocked)
      return res.status(403).json({ success: false, message: "Account has been blocked" });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

// ─── Update profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "bloodGroup", "medicalConditions",
      "allergies", "address", "emergencyContacts", "fcmToken",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Forgot password (send OTP) ───────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: "Email not registered" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ success: true, message: "OTP sent to your email", userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user || user.otp !== otp || user.otpExpire < Date.now())
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};