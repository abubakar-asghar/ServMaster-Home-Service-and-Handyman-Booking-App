import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  socket: null,

  // Setter methods
  setChats: (chats) => set({ chats: sortChatsByLastMessage(chats) }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setMessages: (messages) => set({ messages }),
  setSocket: (socket) => set({ socket }),

  // Chat operations
  addOrUpdateChat: (newChat) =>
    set((state) => {
      const existingIndex = state.chats.findIndex((c) => c._id === newChat._id);
      const updatedChats =
        existingIndex >= 0
          ? state.chats.map((c) => (c._id === newChat._id ? newChat : c))
          : [...state.chats, newChat];
      return { chats: sortChatsByLastMessage(updatedChats) };
    }),

  // Message operations
  addMessage: (newMessage) =>
    set((state) => {
      // Update messages list
      const updatedMessages = state.messages.some(
        (m) => m._id === newMessage._id
      )
        ? state.messages
        : [...state.messages, newMessage];

      // Update last message in chats
      const updatedChats = state.chats.map((chat) =>
        chat._id === newMessage.chat
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
          : chat
      );

      return {
        messages: updatedMessages,
        chats: sortChatsByLastMessage(updatedChats),
      };
    }),

  prependMessages: (olderMessages) =>
    set((state) => ({
      messages: [...olderMessages, ...state.messages],
    })),

  markMessagesAsSeen: (chatId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.chat === chatId ? { ...msg, seen: true } : msg
      ),
      chats: state.chats.map((chat) =>
        chat._id === chatId && chat.lastMessage
          ? { ...chat, lastMessage: { ...chat.lastMessage, seen: true } }
          : chat
      ),
    })),

  // Socket.io operations
  initializeSocket: (socket) => {
    set({ socket });
    socket.on("newMessage", (message) => {
      get().addMessage(message);
    });
    socket.on("messageSeen", ({ chatId }) => {
      get().markMessagesAsSeen(chatId);
    });
  },

  // Utility methods
  getUnreadCount: (chatId) => {
    return get().messages.filter(
      (msg) =>
        msg.chat === chatId &&
        !msg.seen &&
        msg.senderType !==
          (get().selectedChat?.participants[0]?.participantType === "Customer"
            ? "Customer"
            : "ServiceProvider")
    ).length;
  },
}));

// Helper function to sort chats by last message time
const sortChatsByLastMessage = (chats) => {
  return [...chats].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt || b.updatedAt) -
      new Date(a.lastMessage?.createdAt || a.updatedAt)
  );
};

// import { create } from "zustand";

// export const useChatStore = create((set, get) => ({
//   chats: [],
//   setChats: (chatsOrUpdater) =>
//     set((state) => ({
//       chats:
//         typeof chatsOrUpdater === "function"
//           ? chatsOrUpdater(state.chats)
//           : chatsOrUpdater,
//     })),

//   // Currently selected chat (object or null)
//   selectedChat: null,
//   setSelectedChat: (chat) => set({ selectedChat: chat }),

//   // Messages of the active chat
//   messages: [],
//   setMessages: (messagesOrUpdater) =>
//     set((state) => ({
//       messages:
//         typeof messagesOrUpdater === "function"
//           ? messagesOrUpdater(state.messages)
//           : messagesOrUpdater,
//     })),

//   // Add new message and update last message in chat list
//   addMessage: (newMessage) =>
//     set((state) => {
//       // Check if message already exists
//       const exists = state.messages.some((msg) => msg._id === newMessage._id);
//       if (exists) return {};

//       // Update chat list with new last message
//       const updatedChats = state.chats
//         .map((chat) => {
//           if (chat._id === newMessage.chat) {
//             return {
//               ...chat,
//               lastMessage: newMessage,
//               updatedAt: new Date(),
//             };
//           }
//           return chat;
//         })
//         .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

//       return {
//         messages: [...state.messages, newMessage],
//         chats: updatedChats,
//       };
//     }),

//   // For loading older messages (pagination)
//   prependMessages: (olderMessages = []) =>
//     set((state) => ({
//       messages: [...olderMessages, ...state.messages],
//     })),

//   // Update specific message (e.g., mark as seen)
//   updateMessage: (id, updates) =>
//     set((state) => ({
//       messages: state.messages.map((msg) =>
//         msg._id === id ? { ...msg, ...updates } : msg
//       ),
//     })),

//   // Mark all messages in current chat as seen
//   markMessagesAsSeen: (chatId) =>
//     set((state) => ({
//       messages: state.messages.map((msg) =>
//         msg.chat === chatId ? { ...msg, seen: true } : msg
//       ),
//       chats: state.chats.map((chat) => {
//         if (chat._id === chatId && chat.lastMessage) {
//           return {
//             ...chat,
//             lastMessage: { ...chat.lastMessage, seen: true },
//           };
//         }
//         return chat;
//       }),
//     })),

//   // Activate a chat (when service request is accepted)
//   activateChat: (chatId) =>
//     set((state) => ({
//       chats: state.chats.map((chat) =>
//         chat._id === chatId ? { ...chat, isActive: true } : chat
//       ),
//     })),

//   // Clear messages when leaving chat
//   clearMessages: () => set({ messages: [] }),

//   // Get unread count for a specific chat
//   getUnreadCount: (chatId) => {
//     return get().messages.filter((msg) => msg.chat === chatId && !msg.seen)
//       .length;
//   },

//   // Get total unread count across all chats
//   getTotalUnreadCount: () => {
//     return get().chats.reduce((total, chat) => {
//       if (chat.lastMessage && !chat.lastMessage.seen) {
//         return total + 1;
//       }
//       return total;
//     }, 0);
//   },

//   // Find chat by service request ID
//   findChatByServiceRequest: (serviceRequestId) => {
//     return get().chats.find(
//       (chat) => chat.activeServiceRequest?.toString() === serviceRequestId
//     );
//   },
// }));
