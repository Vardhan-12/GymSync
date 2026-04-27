import axios from "../../services/axiosInstance";

// 🔹 get smart suggestions
export const getSuggestions = async () => {
  const res = await axios.get("/match/suggestions");
  return res.data;
};

// 🔹 send request
export const sendRequest = async (recipientId) => {
  const res = await axios.post("/match/request", { recipientId });
  return res.data;
};

// 🔹 get my matches (accepted)
export const getMyMatches = async () => {
  const res = await axios.get("/match/my");
  return res.data;
};

// 🔹 incoming requests
export const getIncoming = async () => {
  const res = await axios.get("/match/incoming");
  return res.data;
};