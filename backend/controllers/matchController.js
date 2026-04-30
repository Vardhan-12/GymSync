// ================= IMPORTS =================
const Match = require("../models/Match");
const Message = require("../models/Message");
const User = require("../models/User");
const Session = require("../models/Session");
const densityService = require("../services/densityService");

/* =====================================================
   1. SEND MATCH REQUEST
===================================================== */
const sendMatchRequest = async (req, res) => {
  try {
    const requester = req.user._id;
    const { recipientId } = req.body;

    // ❌ cannot match yourself
    if (requester.toString() === recipientId) {
      return res.status(400).json({ message: "Cannot match yourself" });
    }

    // ❌ prevent duplicate requests
    const existing = await Match.findOne({
      $or: [
        { requester, recipient: recipientId },
        { requester: recipientId, recipient: requester },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    // ✅ create match request
    const match = await Match.create({
      requester,
      recipient: recipientId,
    });

    res.status(201).json(match);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   2. GET MY MATCHES (ACCEPTED ONLY + LAST MESSAGE)
===================================================== */
const getMyMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      status: "accepted",
      $or: [
        { requester: userId },
        { recipient: userId },
      ],
    })
      .populate("requester", "name")
      .populate("recipient", "name");

    // 🔥 attach last message to each match
    const results = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ match: match._id })
          .sort({ createdAt: -1 })
          .select("text createdAt sender");

        return {
          ...match.toObject(),
          lastMessage,
        };
      })
    );

    res.json(results);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. GET INCOMING REQUESTS
===================================================== */
const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Match.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "name email");

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   4. ACCEPT / REJECT REQUEST
===================================================== */
const respondToRequest = async (req, res) => {
  try {
    const { matchId, action } = req.body;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // 🔐 only recipient can respond
    if (match.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    match.status = action; // "accepted" or "rejected"
    await match.save();

    res.json(match);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. 🔥 SMART PARTNER SUGGESTIONS (AI LOGIC)
===================================================== */
const getMatchSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔹 current user
    const currentUser = await User.findById(userId);

    // 🔹 get all sessions of current user
    const mySessions = await Session.find({ createdBy: userId });

    // ❌ no sessions → no suggestions
    if (mySessions.length === 0) {
      return res.json([]);
    }

    let suggestionsMap = new Map();

    /* ===============================
       STEP 1: FIND OVERLAPPING USERS
    =============================== */
    for (const session of mySessions) {
      const users = await densityService.findOverlappingUsers(session._id);

      users.forEach((u) => {
        const key = u._id.toString();

        if (!suggestionsMap.has(key)) {
          suggestionsMap.set(key, {
            user: u,
            overlapScore: 1,
            timeScore: 0,
          });
        } else {
          suggestionsMap.get(key).overlapScore++;
        }
      });
    }

    /* ===============================
       STEP 2: ADD TIME MATCH SCORE
    =============================== */
    for (const [key, value] of suggestionsMap.entries()) {

      const u = await User.findById(value.user._id);

      // ✅ same preferred workout time
      if (
        u.preferredWorkoutTime &&
        u.preferredWorkoutTime === currentUser.preferredWorkoutTime
      ) {
        value.timeScore = 2;
      }

      // 🔥 FINAL SCORE
      value.totalScore =
        value.overlapScore * 3 +
        value.timeScore;
    }

    /* ===============================
       STEP 3: SORT BY SCORE
    =============================== */
    const suggestions = Array.from(suggestionsMap.values());

    suggestions.sort((a, b) => b.totalScore - a.totalScore);

    res.json(suggestions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   EXPORTS (IMPORTANT — ONLY ONE EXPORT BLOCK)
===================================================== */
module.exports = {
  sendMatchRequest,
  getMyMatches,
  getIncomingRequests,
  respondToRequest,
  getMatchSuggestions,
};