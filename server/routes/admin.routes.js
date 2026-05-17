const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  changeRole,
  getAnalytics,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", toggleBlockUser);
router.patch("/users/:userId/role", changeRole);
router.get("/analytics", getAnalytics);

module.exports = router;