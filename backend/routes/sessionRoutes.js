const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");

const sessionController = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");
const {
  createSessionValidator,
  densityValidator,
  overlapValidator,
} = require("../validators/sessionValidator");

router.post(
  "/",
  protect,
  createSessionValidator,
  sessionController.createSession
);

router.get("/", protect, sessionController.getSessions);

router.delete("/:id", protect, sessionController.deleteSession);

router.get(
  "/density",
  protect,
  densityValidator,
  sessionController.getDensityByDate
);

router.get(
  "/overlap/:sessionId",
  protect,
  overlapValidator,
  sessionController.getOverlappingUsers
);

router.get("/summary", protect, sessionController.getSessionSummary);
router.get(
  "/weekly-summary",
  protect,
  //authorize("admin"),
  sessionController.getWeeklySummary
);

router.get("/peak-hours", protect, sessionController.getPeakHours);
router.get("/best-time", protect, sessionController.getBestTimePrediction);

module.exports = router;