// ================== IMPORTS ==================
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  sendMatchRequest,
  getMyMatches,
  getIncomingRequests,
  respondToRequest,
  getMatchSuggestions, // ✅ IMPORTANT
} = require("../controllers/matchController");


// ================== ROUTES ==================

// 🔹 send match request
router.post("/request", protect, sendMatchRequest);

// 🔹 get accepted matches (chat list)
router.get("/my", protect, getMyMatches);

// 🔹 get incoming requests
router.get("/incoming", protect, getIncomingRequests);

// 🔹 accept / reject request
router.post("/respond", protect, respondToRequest);

// 🔹 smart partner suggestions (🔥 main feature)
router.get("/suggestions", protect, getMatchSuggestions);


// ================== EXPORT ==================
module.exports = router;