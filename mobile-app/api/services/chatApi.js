import axiosInstance from "../axiosInstance";

export const getAllChats = () => {
  const response = axiosInstance.get("/api/chats");
  return response.data;
};
