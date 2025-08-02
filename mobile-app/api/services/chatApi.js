import axiosInstance from "../axiosInstance";

// ✅ Get all chats for provider
export const getAllProviderChats = async () => {
  const response = await axiosInstance.get("/api/chats/provider");
  return response.data;
};

// ✅ Get all chats for customer
export const getAllCustomerChats = async () => {
  const response = await axiosInstance.get("/api/chats/customer");
  return response.data;
};

// ✅ Get all messages in a specific chat
export const getChatMessages = async (chatId) => {
  const response = await axiosInstance.get(`/api/chats/messages/${chatId}`);
  return response.data;
};

// ✅ Send a message to a chat
export const sendMessage = async ({ chatId, content }) => {
  const response = await axiosInstance.post(
    `/api/chats/message/${chatId}`,
    content
  );
  return response.data;
};

// ✅ Send a message to a chat with SOCKET.io
export const sendMessageWithSocket = async ({ chatId, content }) => {
  const response = await axiosInstance.post(
    `/api/chats/socket-message/${chatId}`,
    content
  );
  return response.data;
};
