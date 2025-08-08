// store/chatStore.js
import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  chats: [],
  selectedChat: null,
  messages: [],
  onlineUsers: new Set(),
  notifications: [],
  connectionError: null,

  // Initialize socket connection (called from _layout.js)
  setSocket: (socket) => {
    if (!socket) return;

    // Setup socket listeners
    socket.on("connect", () => {
      set({ isConnected: true, connectionError: null });
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      set({ connectionError: error.message });
      console.error("Socket connection error:", error);
    });

    socket.on("newMessage", (message) => {
      get().addMessage(message);
      console.log("New message received:", message);
    });

    socket.on("messagesSeen", ({ chatId }) => {
      get().markMessagesAsSeen(chatId);
      console.log("Messages marked as seen for chat:", chatId);
    });

    socket.on("userStatusChanged", ({ userId, status }) => {
      const onlineUsers = new Set(get().onlineUsers);
      if (status === "online") {
        onlineUsers.add(userId);
      } else {
        onlineUsers.delete(userId);
      }
      set({ onlineUsers });
      console.log(`User ${userId} is now ${status}`);
    });

    socket.on("newMessageNotification", ({ chatId, message }) => {
      if (get().selectedChat?._id !== chatId) {
        set((state) => ({
          notifications: [...state.notifications, { chatId, message }],
        }));
        console.log("New message notification for chat:", chatId);
      }
    });

    socket.on("messageError", ({ error }) => {
      console.error("Message error:", error);
      // You can add error handling logic here
    });

    set({ socket, isConnected: socket.connected });
  },

  // Chat management
  setChats: (chats) => set({ chats: sortChats(chats) }),
  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
    // Clear notifications for this chat when selected
    if (chat?._id) {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.chatId !== chat._id),
      }));
    }
  },
  setMessages: (messages) => set({ messages }),

  // Message handling
  addMessage: (newMessage) => {
    set((state) => {
      // Replace optimistic message if exists
      const existingMessages = state.messages.filter(
        (m) => !m.isOptimistic || m.tempId !== newMessage.tempId
      );

      // Update chat list with new last message
      const updatedChats = state.chats.map((chat) =>
        chat._id === newMessage.chat
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
          : chat
      );

      return {
        messages: [...existingMessages, newMessage],
        chats: sortChats(updatedChats),
      };
    });
  },

  // Send message with optimistic UI
  sendMessage: (text, chatId, senderType) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) {
      throw new Error("Socket not connected");
    }

    const tempId = Date.now().toString();
    const userId = get().user?._id;

    // Optimistic message
    const optimisticMessage = {
      _id: tempId,
      tempId,
      chat: chatId,
      text,
      sender: userId,
      senderType,
      createdAt: new Date().toISOString(),
      seen: false,
      isOptimistic: true,
    };

    get().addMessage(optimisticMessage);

    // Send via socket
    socket.emit("sendMessage", {
      chatId,
      content: { text, senderType },
      tempId,
    });

    return tempId; // Return tempId for potential error handling
  },

  // Mark messages as seen
  markMessagesAsSeen: (chatId) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) return;

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.chat === chatId ? { ...msg, seen: true, seenAt: new Date() } : msg
      ),
    }));

    socket.emit("markMessagesAsSeen", { chatId });
  },

  // Join a chat room
  joinChat: (chatId) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) return;

    socket.emit("joinChat", chatId);
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Cleanup
  cleanup: () => {
    const { socket } = get();
    if (socket) {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("userStatusChanged");
      socket.off("newMessageNotification");
      socket.off("messageError");
    }
    set({
      socket: null,
      isConnected: false,
      chats: [],
      selectedChat: null,
      messages: [],
      onlineUsers: new Set(),
      notifications: [],
      connectionError: null,
    });
  },
}));

// Helper to sort chats by last activity
const sortChats = (chats) =>
  [...chats].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt || b.updatedAt) -
      new Date(a.lastMessage?.createdAt || a.updatedAt)
  );
// import { create } from "zustand";

// export const useChatStore = create((set, get) => ({
//   chats: [],
//   selectedChat: null,
//   messages: [],
//   socket: null,

//   // Setter methods
//   setChats: (chats) => set({ chats: sortChatsByLastMessage(chats) }),
//   setSelectedChat: (chat) => set({ selectedChat: chat }),
//   setMessages: (messages) => set({ messages }),
//   setSocket: (socket) => set({ socket }),

//   // Chat operations
//   addOrUpdateChat: (newChat) =>
//     set((state) => {
//       const existingIndex = state.chats.findIndex((c) => c._id === newChat._id);
//       const updatedChats =
//         existingIndex >= 0
//           ? state.chats.map((c) => (c._id === newChat._id ? newChat : c))
//           : [...state.chats, newChat];
//       return { chats: sortChatsByLastMessage(updatedChats) };
//     }),

//   // Message operations
//   addMessage: (newMessage) => {
//     set((state) => {
//       console.log("Adding message:", newMessage);

//       // Enhanced duplicate check
//       const duplicate = state.messages.some(
//         (msg) =>
//           // Match by server ID
//           msg._id === newMessage._id ||
//           // Match optimistic by tempId
//           (msg.tempId && msg.tempId === newMessage.tempId) ||
//           // Match same content from same sender at same time
//           (msg.text === newMessage.text &&
//             msg.sender === newMessage.sender &&
//             Math.abs(
//               new Date(msg.createdAt) - new Date(newMessage.createdAt) < 1000
//             ))
//       );

//       if (duplicate) {
//         console.log("Duplicate detected - skipping");
//         return state;
//       }

//       // Remove any optimistic version
//       const filteredMessages = newMessage.tempId
//         ? state.messages.filter((msg) => msg.tempId !== newMessage.tempId)
//         : state.messages;

//       // Update last message in chats if this is new
//       const updatedChats = state.chats.map((chat) =>
//         chat._id === newMessage.chat
//           ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
//           : chat
//       );

//       return {
//         messages: [...filteredMessages, newMessage],
//         chats: sortChatsByLastMessage(updatedChats),
//       };
//     });
//   },

//   mergeMessages: (newMessages) => {
//     set((state) => {
//       // Create a map of existing messages by _id for quick lookup
//       const existingMessages = new Map(
//         state.messages.map((msg) => [msg._id, msg])
//       );

//       // Merge new messages, preserving any local modifications
//       const mergedMessages = newMessages.reduce(
//         (acc, newMsg) => {
//           const existingMsg = existingMessages.get(newMsg._id);

//           // Keep existing message if it's newer or has local modifications
//           if (
//             existingMsg &&
//             (new Date(existingMsg.updatedAt) > new Date(newMsg.updatedAt) ||
//               existingMsg.isOptimistic)
//           ) {
//             return acc;
//           }

//           return [...acc, newMsg];
//         },
//         [...state.messages]
//       );

//       return {
//         messages: mergedMessages,
//         // Update chats if needed
//         // chats: state.chats.map((chat) =>
//         //   chat._id === selectedChat?._id
//         //     ? {
//         //         ...chat,
//         //         lastMessage: mergedMessages[mergedMessages.length - 1],
//         //       }
//         //     : chat
//         // ),
//       };
//     });
//   },

//   prependMessages: (olderMessages) =>
//     set((state) => ({
//       messages: [...olderMessages, ...state.messages],
//     })),

//   markMessagesAsSeen: (chatId) =>
//     set((state) => ({
//       messages: state.messages.map((msg) =>
//         msg.chat === chatId ? { ...msg, seen: true } : msg
//       ),
//       chats: state.chats.map((chat) =>
//         chat._id === chatId && chat.lastMessage
//           ? { ...chat, lastMessage: { ...chat.lastMessage, seen: true } }
//           : chat
//       ),
//     })),

//   // Socket.io operations
//   initializeSocket: (socket) => {
//     set({ socket });
//     socket.on("newMessage", (message) => {
//       get().addMessage(message);
//     });
//     socket.on("messageSeen", ({ chatId }) => {
//       get().markMessagesAsSeen(chatId);
//     });
//   },

//   // Utility methods
//   getUnreadCount: (chatId) => {
//     return get().messages.filter(
//       (msg) =>
//         msg.chat === chatId &&
//         !msg.seen &&
//         msg.senderType !==
//           (get().selectedChat?.participants[0]?.participantType === "Customer"
//             ? "Customer"
//             : "ServiceProvider")
//     ).length;
//   },
// }));

// // Helper function to sort chats by last message time
// const sortChatsByLastMessage = (chats) => {
//   return [...chats].sort(
//     (a, b) =>
//       new Date(b.lastMessage?.createdAt || b.updatedAt) -
//       new Date(a.lastMessage?.createdAt || a.updatedAt)
//   );
// };

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
