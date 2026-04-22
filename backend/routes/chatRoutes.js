const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getMyChats,
} = require("../controllers/chatController");

router.post("/send", protect, sendMessage);
router.get("/my-chats", protect, getMyChats);
router.get("/:matchId", protect, getMessages);


module.exports = router;