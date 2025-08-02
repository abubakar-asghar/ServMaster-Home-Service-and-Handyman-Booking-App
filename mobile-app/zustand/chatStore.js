import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  // Currently selected chat (object or null)
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),

  // Messages of the active chat
  messages: [],
  setMessages: (messagesOrUpdater) =>
    set((state) => ({
      messages:
        typeof messagesOrUpdater === "function"
          ? messagesOrUpdater(state.messages)
          : messagesOrUpdater,
    })),

  addMessage: (newMessage) =>
    set((state) => {
      const exists = state.messages.some((msg) => msg._id === newMessage._id);
      if (exists) return {}; // do not update
      return { messages: [...state.messages, newMessage] };
    }),

  prependMessages: (olderMessages = []) =>
    set((state) => ({
      messages: [...olderMessages, ...state.messages],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === id ? { ...msg, ...updates } : msg
      ),
    })),

  updateLastMessageInChatList: (newMessage) =>
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat._id === newMessage.chat) {
          return { ...chat, lastMessage: newMessage, updatedAt: new Date() };
        }
        return chat;
      });

      return { chats: updatedChats };
    }),

  clearMessages: () => set({ messages: [] }),
}));

// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { socket } from "../utils/socket";
// import * as api from "../api/services/chatApi";

// const useChatStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       activeChats: [],
//       currentChatId: null,
//       messages: {},
//       unreadCounts: {},
//       onlineStatus: {},
//       connectionStatus: "disconnected",

//       // Getters
//       getCurrentChat: () => {
//         const { currentChatId, activeChats } = get();
//         return activeChats.find((chat) => chat._id === currentChatId);
//       },

//       getChatMessages: (chatId) => get().messages[chatId] || [],

//       // Actions
//       initializeSocket: () => {
//         if (socket.connected) return;

//         socket.connect();
//         set({ connectionStatus: "connecting" });

//         // Setup socket listeners
//         socket.on("connect", () => {
//           set({ connectionStatus: "connected" });
//           // Rejoin any active chats
//           get().activeChats.forEach((chat) => {
//             socket.emit("joinChat", chat._id);
//           });
//         });

//         socket.on("newMessage", (message) => {
//           get().handleNewMessage(message);
//         });

//         socket.on("chatStatusChanged", ({ chatId, isActive }) => {
//           get().handleChatStatusChange(chatId, isActive);
//         });

//         socket.on("disconnect", () => {
//           set({ connectionStatus: "disconnected" });
//         });
//       },

//       loadChats: async (userType) => {
//         try {
//           const fetchFn =
//             userType === "provider"
//               ? api.getAllProviderChats
//               : api.getAllCustomerChats;

//           const res = await fetchFn();

//           set({
//             activeChats: res.data,
//             unreadCounts: res.data.reduce(
//               (acc, chat) => ({
//                 ...acc,
//                 [chat._id]: chat.unreadCount || 0,
//               }),
//               {}
//             ),
//           });
//         } catch (error) {
//           console.error("Failed to load chats:", error);
//         }
//       },

//       setCurrentChat: (chatId) => {
//         socket.emit("joinChat", chatId);
//         set({ currentChatId: chatId });
//         get().markMessagesAsRead(chatId);
//       },

//       sendMessage: async (content) => {
//         const { currentChatId } = get();
//         if (!currentChatId) return;

//         try {
//           // Optimistic update
//           const tempId = Date.now().toString();
//           set((state) => ({
//             messages: {
//               ...state.messages,
//               [currentChatId]: [
//                 {
//                   _id: tempId,
//                   text: content,
//                   sender: socket.id, // Temporary sender
//                   senderType: "Customer", // Will be replaced by actual sender from server
//                   chat: currentChatId,
//                   isOptimistic: true,
//                   createdAt: new Date().toISOString(),
//                 },
//                 ...(state.messages[currentChatId] || []),
//               ],
//             },
//           }));

//           // Real API call
//           const res = await api.sendMessageWithSocket({
//             chatId: currentChatId,
//             content: { text: content },
//           });

//           // Replace optimistic message
//           set((state) => ({
//             messages: {
//               ...state.messages,
//               [currentChatId]: state.messages[currentChatId].map((msg) =>
//                 msg._id === tempId ? res.data : msg
//               ),
//             },
//           }));
//         } catch (error) {
//           // Rollback optimistic update
//           set((state) => ({
//             messages: {
//               ...state.messages,
//               [currentChatId]: state.messages[currentChatId].filter(
//                 (msg) => msg._id !== tempId
//               ),
//             },
//           }));
//           throw error;
//         }
//       },

//       handleNewMessage: (message) => {
//         set((state) => {
//           const isCurrentChat = state.currentChatId === message.chat;

//           return {
//             messages: {
//               ...state.messages,
//               [message.chat]: [
//                 message,
//                 ...(state.messages[message.chat] || []),
//               ],
//             },
//             unreadCounts: {
//               ...state.unreadCounts,
//               [message.chat]: isCurrentChat
//                 ? 0
//                 : (state.unreadCounts[message.chat] || 0) + 1,
//             },
//           };
//         });
//       },

//       markMessagesAsRead: (chatId) => {
//         socket.emit("markAsSeen", { chatId });
//         set((state) => ({
//           unreadCounts: {
//             ...state.unreadCounts,
//             [chatId]: 0,
//           },
//         }));
//       },

//       handleChatStatusChange: (chatId, isActive) => {
//         set((state) => ({
//           activeChats: state.activeChats.map((chat) =>
//             chat._id === chatId ? { ...chat, isActive } : chat
//           ),
//         }));
//       },

//       disconnect: () => {
//         socket.disconnect();
//         set({ connectionStatus: "disconnected" });
//       },
//     }),
//     {
//       name: "chat-storage",
//       partialize: (state) => ({
//         activeChats: state.activeChats,
//         unreadCounts: state.unreadCounts,
//       }),
//     }
//   )
// );

// export default useChatStore;
