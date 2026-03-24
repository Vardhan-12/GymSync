const WorkoutSession = require("../models/WorkoutSession");
const AppError = require("../utils/AppError");
const calculateWorkoutVolume = require("../utils/calculateWorkoutVolume");

// Create workout
exports.createWorkoutSession = async (data, userId) => {
  const { title, exercises } = data;

  if (!title) {
    throw new AppError("Workout title required");
  }

  const totalVolume = calculateWorkoutVolume(exercises);

  const session = await WorkoutSession.create({
    title,
    exercises,
    totalVolume, // ✅ added
    createdBy: userId
  });

  return session;
};

// Get workouts
exports.getWorkoutSessions = async (userId) => {

  return await WorkoutSession.find({
    createdBy: userId
  }).sort({ createdAt: -1 });

};

// Delete workout
exports.deleteWorkoutSession = async (id, userId) => {

  const session = await WorkoutSession.findById(id);

  if (!session) {
    throw new AppError("Workout session not found", 404);
  }

  if (session.createdBy.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  await session.deleteOne();

  return { message: "Workout session deleted" };

};


//addLikes
exports.toggleLikeWorkout = async (sessionId, userId) => {

  const session = await WorkoutSession.findById(sessionId);

  if (!session) {
    throw new AppError("Workout session not found", 404);
  }

  const alreadyLiked = session.likes.includes(userId);

  if (alreadyLiked) {
    session.likes = session.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
  } else {
    session.likes.push(userId);
  }

  await session.save();

  return session.likes.length;

};


//addComment
exports.addComment = async (sessionId, userId, text) => {

  const session = await WorkoutSession.findById(sessionId);

  if (!session) {
    throw new AppError("Workout session not found", 404);
  }

  session.comments.push({
    user: userId,
    text
  });

  await session.save();

  return session.comments;

};

exports.updateWorkoutSession = async (id, userId, data) => {
  const session = await WorkoutSession.findById(id);

  if (!session) {
    throw new AppError("Workout session not found", 404);
  }

  if (session.createdBy.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  session.title = data.title || session.title;
  session.exercises = data.exercises || session.exercises;

  // ✅ Recalculate volume when exercises change
  session.totalVolume = calculateWorkoutVolume(session.exercises);

  await session.save();

  return session;
};

