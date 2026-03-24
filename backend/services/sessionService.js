const Session = require("../models/Session");
const AppError = require("../utils/AppError");

// Create session
exports.createSession = async (data, userId) => {
  const { startTime, duration } = data;

  if (!startTime || !duration) {
    throw new AppError("Start time and duration are required");
  }

  if (duration > 180) {
    throw new AppError("Duration cannot exceed 180 minutes");
  }

  const session = await Session.create({
    startTime,
    duration,
    createdBy: userId,
  });

  return session;
};

// Get paginated sessions
exports.getSessions = async (userId, page = 1, limit = 5) => {
  const skip = (page - 1) * limit;

  const sessions = await Session.find({ createdBy: userId })
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email");

  const total = await Session.countDocuments({ createdBy: userId });

  return {
    sessions,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// Delete session
exports.deleteSession = async (sessionId, userId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.createdBy.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  await session.deleteOne();

  return { message: "Session deleted successfully" };
};

//get latest workout

exports.getLatestWorkout = async (userId) => {
  return await WorkoutSession.findOne({ createdBy: userId })
    .sort({ createdAt: -1 });
};