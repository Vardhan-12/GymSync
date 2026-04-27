import axios from "../../services/axiosInstance";

// 🔹 get profile
export const getProfile = async () => {
  const res = await axios.get("/users/me");
  return res.data;
};

// 🔹 update profile
export const updateProfile = async (data) => {
  const res = await axios.put("/users/me", data);
  return res.data;
};

// 🔹 get users from sessions
export const getUsersFromSessions = async () => {
  const res = await axios.get("/users/from-sessions");
  return res.data;
};

// 🔹 send match request
export const sendMatchRequest = async (recipientId) => {
  const res = await axios.post("/match/request", { recipientId });
  return res.data;
};

// 🔹 get matches
export const getMyMatches = async () => {
  const res = await axios.get("/match/my");
  return res.data;
};

// 🔹 incoming requests
export const getIncomingRequests = async () => {
  const res = await axios.get("/match/incoming");
  return res.data;
};

// 🔹 respond
export const respondToRequest = async (matchId, action) => {
  const res = await axios.post("/match/respond", {
    matchId,
    action,
  });
  return res.data;
};