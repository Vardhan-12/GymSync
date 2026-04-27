const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getUsersFromSessions,
  getMyProfile,
  updateProfile,
} = require("../controllers/userController");

// 🔹 profile
router.get("/me", protect, getMyProfile);

// 🔹 update profile
router.put("/me", protect, updateProfile);

// 🔹 partner discovery
router.get("/from-sessions", protect, getUsersFromSessions);

module.exports = router;