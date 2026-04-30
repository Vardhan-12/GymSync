const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

// 🔹 import all controller functions
const {
  sendMatchRequest,
  getMyMatches,
  getIncomingRequests,
  respondToRequest,
  getMatchSuggestions,
} = require("../controllers/matchController");

/* ================= ROUTES ================= */

// 🔹 send match request
router.post("/request", protect, sendMatchRequest);

// 🔹 get accepted matches (chat list)
router.get("/my", protect, getMyMatches);

// 🔹 incoming requests
router.get("/incoming", protect, getIncomingRequests);

// 🔹 accept / reject request
router.post("/respond", protect, respondToRequest);

// 🔥 smart suggestions (AI)
router.get("/suggestions", protect, getMatchSuggestions);

module.exports = router;