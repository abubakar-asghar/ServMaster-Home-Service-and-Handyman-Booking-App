import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  getAllProviderChats,
  getAllCustomerChats,
  getChatMessages,
  sendMessage,
  sendMessageWithSocket,
} from "../api/services/chatApi";
import { useEffect } from "react";
import { useChatStore } from "../zustand/chatStore";

// Common configuration for chat queries
const chatQueryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  onError: (error) => {
    Alert.alert("Error", error?.message || "Failed to fetch chat data");
  },
};

export const useGetAllProviderChats = () => {
  const { setChats } = useChatStore();
  return useQuery({
    queryKey: ["provider-chats"],
    queryFn: getAllProviderChats,
    ...chatQueryConfig,
    onSuccess: (data) => setChats(data.data),
  });
};

export const useGetAllCustomerChats = () => {
  const { setChats } = useChatStore();
  return useQuery({
    queryKey: ["customer-chats"],
    queryFn: getAllCustomerChats,
    ...chatQueryConfig,
    onSuccess: (data) => setChats(data.data),
  });
};

export const useGetChatMessages = (chatId) => {
  const { setMessages, markMessagesAsSeen } = useChatStore();
  return useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
    ...chatQueryConfig,
    onSuccess: (data) => {
      setMessages(data.data || []);
      if (data.data?.length) markMessagesAsSeen(chatId);
    },
  });
};

export const useSendMessage = () => {
  const { addMessage } = useChatStore();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => data.data && addMessage(data.data),
    onError: (error) => {
      Alert.alert("Error", error?.message || "Failed to send message");
    },
  });
};

export const useSocketChat = (socket) => {
  const { initializeSocket } = useChatStore();

  // Initialize socket when hook is used
  useEffect(() => {
    if (socket) initializeSocket(socket);
    return () => {
      socket?.off("newMessage");
      socket?.off("messageSeen");
    };
  }, [socket]);
};

// Optimistic updates version for Socket.io messages
export const useSendMessageWithSocket = () => {
  const { addMessage, socket } = useChatStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content }) => {
      // Send via socket
      const response = await sendMessageWithSocket({ chatId, content });

      // Replace optimistic message with real one
      if (response.data) {
        console.log(response.data);
        addMessage(response.data);
      }
      return response;
    },
    onError: (error, variables) => {
      Alert.alert("Error", error?.message || "Failed to send message");
    },
  });
};
