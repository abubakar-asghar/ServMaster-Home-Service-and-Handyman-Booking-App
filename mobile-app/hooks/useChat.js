import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllProviderChats,
  getAllCustomerChats,
  getChatMessages,
  sendMessage,
  sendMessageWithSocket,
} from "../api/services/chatApi";
import { useChatStore } from "../zustand/chatStore";
import { Alert } from "react-native";

// ✅ Fetch all chats for service providers
export const useGetAllProviderChats = () => {
  return useQuery({
    queryKey: ["provider-chats"],
    queryFn: getAllProviderChats,
  });
};

// ✅ Fetch all chats for customers
export const useGetAllCustomerChats = () => {
  return useQuery({
    queryKey: ["customer-chats"],
    queryFn: getAllCustomerChats,
  });
};

// ✅ Fetch messages for a given chat
export const useGetChatMessages = (chatId) => {
  const { setMessages } = useChatStore();

  return useQuery({
    queryKey: ["user-chat-messages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
    onSuccess: (res) => {
      setMessages(res.data || []);
    },
  });
};

// ✅ Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { addMessage } = useChatStore();

  return useMutation({
    mutationFn: ({ chatId, content }) => sendMessage({ chatId, content }),
    mutationKey: ["send-message"],
    onSuccess: (res, { chatId }) => {
      if (res.data) {
        addMessage(res.data); // ✅ Add message to Zustand store immediately
      }

      // Optionally refetch or update React Query cache
      queryClient.invalidateQueries(["user-chat-messages", chatId]);
    },
    onError: (err) => {
      Alert.alert(
        "Error",
        err?.message || "Something went wrong while sending message"
      );
    },
  });
};

// ✅ Send a message
export const useSendMessageWithSocket = () => {
  const queryClient = useQueryClient();
  const { addMessage } = useChatStore();

  return useMutation({
    mutationFn: ({ chatId, content }) =>
      sendMessageWithSocket({ chatId, content }),
    mutationKey: ["send-message-with-socket"],
    onSuccess: (res, { chatId }) => {
      if (res.data) {
        addMessage(res.data); // ✅ Add message to Zustand store immediately
      }

      // Optionally refetch or update React Query cache
      queryClient.invalidateQueries(["user-chat-messages", chatId]);
    },
    onError: (err) => {
      Alert.alert(
        "Error",
        err?.message || "Something went wrong while sending message"
      );
    },
  });
};
