// ================== IMPORTS ==================
const Message = require("../models/Message");
const Match = require("../models/Match");


// ================== SEND MESSAGE ==================
exports.sendMessage = async (req, res) => {
  try {
    const { matchId, text } = req.body;
    const userId = req.user._id;

    // 🔹 1. Check if match exists and is accepted
    const match = await Match.findById(matchId);

    if (!match || match.status !== "accepted") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔹 2. Check if current user is part of this match
    if (
      match.requester.toString() !== userId.toString() &&
      match.recipient.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔹 3. Create message
    const message = await Message.create({
      match: matchId,
      sender: userId,
      text,
      isRead: false, // unread by default
    });

    // 🔹 4. Send response
    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== GET MESSAGES (WITH PAGINATION) ==================
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    // 🔹 Pagination values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 🔹 1. Check match
    const match = await Match.findById(matchId);

    if (!match || match.status !== "accepted") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔹 2. Check authorization
    if (
      match.requester.toString() !== userId.toString() &&
      match.recipient.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔹 3. Mark messages as READ (important)
    await Message.updateMany(
      {
        match: matchId,
        sender: { $ne: userId }, // messages from other user
        isRead: false,
      },
      { isRead: true }
    );

    // 🔹 4. Fetch paginated messages
    const messages = await Message.find({ match: matchId })
      .populate("sender", "name")
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    // 🔹 5. Total count (for pagination)
    const total = await Message.countDocuments({ match: matchId });

    // 🔹 6. Send response
    res.json({
      messages: messages.reverse(), // oldest first for UI
      page,
      total,
      hasMore: skip + limit < total,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== GET MY CHATS ==================
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔹 1. Get all accepted matches
    const matches = await Match.find({
      status: "accepted",
      $or: [
        { requester: userId },
        { recipient: userId },
      ],
    })
      .populate("requester", "name")
      .populate("recipient", "name");

    // 🔹 2. Build chat list
    const chats = await Promise.all(
      matches.map(async (match) => {

        // 🔹 Get last message
        const lastMessage = await Message.findOne({ match: match._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        // 🔹 Get unread count
        const unreadCount = await Message.countDocuments({
          match: match._id,
          sender: { $ne: userId },
          isRead: false,
        });

        // 🔹 Identify the other user
        const otherUser =
          match.requester._id.toString() === userId.toString()
            ? match.recipient
            : match.requester;

        return {
          matchId: match._id,
          user: otherUser,
          lastMessage,
          unreadCount,
        };
      })
    );

    // 🔹 3. Send response
    res.json(chats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};