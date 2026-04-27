// ================== IMPORTS ==================
const Match = require("../models/Match");
const Message = require("../models/Message");
const Session = require("../models/Session");
const densityService = require("../services/densityService");


// ================== SEND MATCH REQUEST ==================
exports.sendMatchRequest = async (req, res) => {
  try {
    const requester = req.user._id;
    const { recipientId } = req.body;

    // ❌ prevent self matching
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
      status: "pending",
    });

    res.status(201).json(match);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== GET MY MATCHES ==================
exports.getMyMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    // only accepted matches
    const matches = await Match.find({
      status: "accepted",
      $or: [
        { requester: userId },
        { recipient: userId },
      ],
    })
      .populate("requester", "name")
      .populate("recipient", "name");

    // ✅ attach last message for chat preview
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


// ================== GET INCOMING REQUESTS ==================
exports.getIncomingRequests = async (req, res) => {
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


// ================== ACCEPT / REJECT REQUEST ==================
exports.respondToRequest = async (req, res) => {
  try {
    const { matchId, action } = req.body;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // ❌ only recipient can respond
    if (match.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ update status
    match.status = action; // "accepted" or "rejected"
    await match.save();

    res.json(match);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== SMART PARTNER SUGGESTIONS ==================
exports.getMatchSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔹 get current user's sessions
    const mySessions = await Session.find({ createdBy: userId });

    if (mySessions.length === 0) {
      return res.json([]);
    }

    // 🔹 store suggestions with overlap count
    let suggestionsMap = new Map();

    for (const session of mySessions) {
      const users = await densityService.findOverlappingUsers(session._id);

      users.forEach((u) => {
        const id = u._id.toString();

        if (!suggestionsMap.has(id)) {
          suggestionsMap.set(id, {
            user: u,
            overlapCount: 1,
          });
        } else {
          suggestionsMap.get(id).overlapCount++;
        }
      });
    }

    // 🔹 convert map → array
    const suggestions = Array.from(suggestionsMap.values());

    // 🔹 sort by best match (highest overlap)
    suggestions.sort((a, b) => b.overlapCount - a.overlapCount);

    res.json(suggestions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};