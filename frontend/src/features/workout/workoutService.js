import axios from "../../services/axiosInstance";

/* ================== BASIC CRUD ================== */

export const createWorkout = async (data) => {
  const res = await axios.post("/workouts", data);
  return res.data;
};

export const getWorkouts = async () => {
  const res = await axios.get("/workouts");
  return res.data;
};

export const deleteWorkout = async (id) => {
  const res = await axios.delete(`/workouts/${id}`);
  return res.data;
};

export const updateWorkout = async (id, data) => {
  const res = await axios.put(`/workouts/${id}`, data);
  return res.data;
};

/* ================== SOCIAL ================== */

export const toggleLikeWorkout = async (id) => {
  const res = await axios.post(`/workouts/${id}/like`);
  return res.data;
};

/* ================== ANALYTICS ================== */

export const getLatestWorkout = async () => {
  const res = await axios.get("/workouts/latest");
  return res.data;
};

export const getUserExercises = async () => {
  const res = await axios.get("/workouts/exercises");
  return res.data;
};

export const getExerciseProgress = async (exercise) => {
  const res = await axios.get(`/workouts/progress/${exercise}`);
  return res.data;
};

export const getVolumeProgress = async () => {
  const res = await axios.get("/workouts/progress/volume");
  return res.data;
};

export const getExerciseInsights = async (exercise) => {
  const res = await axios.get(`/workouts/progress/insights/${exercise}`);
  return res.data;
};