import axios from "../../services/axiosInstance";

export const getMessages = async (matchId, page = 1) => {
  const res = await axios.get(`/chat/${matchId}?page=${page}&limit=20`);
  return res.data;
};

export const sendMessage = async (matchId, text) => {
  const res = await axios.post("/chat/send", {
    matchId,
    text,
  });
  return res.data;
};

export const getMyChats = async () => {
  const res = await axios.get("/chat/my-chats");
  return res.data;
};