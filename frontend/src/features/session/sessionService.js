import axiosInstance from "../../services/axiosInstance";

// CREATE
export const createSession = async (data) => {
  const response = await axiosInstance.post("/sessions", data);
  return response.data;
};

// GET
export const getSessions = async (page = 1) => {
  const response = await axiosInstance.get(`/sessions?page=${page}`);
  return response.data;
};

// DELETE
export const deleteSession = async (id) => {
  const response = await axiosInstance.delete(`/sessions/${id}`);
  return response.data;
};