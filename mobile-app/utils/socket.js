// utils/socket.js
import { io } from "socket.io-client";
import { getUserFromStorage } from "./storage";

let socket;

export const initSocket = async () => {
  const auth = await getUserFromStorage();
  const { user, token } = auth ? auth : {};

  if (!socket && user && token) {
    socket = io("http://192.168.0.106:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected", socket.id);

      // Emit authentication for ALL users (Customer or ServiceProvider)
      socket.emit("authenticate", {
        userId: user._id,
        token,
        userType: user.role, // "Customer" or "ServiceProvider"
      });
    });

    socket.on("userStatusChanged", ({ userId, userType, status }) => {
      console.log(`🔄 ${userType} ${userId} is now ${status}`);
      // You can dispatch a redux/zustand update here
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// import { io } from "socket.io-client";
// import { useChatStore } from "../zustand/chatStore";

// let socket;

// export const initializeSocket = (token) => {
//   if (!socket) {
//     socket = io("http://192.168.0.106:5000", {
//       autoConnect: false,
//       transports: ["websocket"],
//       auth: { token },
//     });

//     // Connect the socket
//     socket.connect();

//     // Set up global event listeners
//     const { addMessage, markMessagesAsSeen } = useChatStore.getState();

//     socket.on("newMessage", (message) => {
//       addMessage(message);
//     });

//     socket.on("messageSeen", ({ chatId }) => {
//       markMessagesAsSeen(chatId);
//     });

//     socket.on("connect_error", (err) => {
//       console.log("Socket connection error:", err.message);
//     });
//   }

//   return socket;
// };

// export const getSocket = () => socket;

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };
// import { io } from "socket.io-client";

// // ✅ Replace with your actual backend URL (adjust for LAN/production)
// export const socket = io("http://192.168.0.106:5000", {
//   autoConnect: false, // Don't connect immediately — connect only after login
//   transports: ["websocket"],
//   withCredentials: true,
// });

// import { io } from "socket.io-client";
// import { Platform } from "react-native";

// // Configure socket connection
// const SOCKET_URL =
//   Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

// export const socket = io("http://192.168.0.106:5000", {
//   autoConnect: false, // We'll manually connect
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
//   transports: ["websocket"],
// });

// // Socket event handlers
// export const setupSocketListeners = (store) => {
//   socket.on("connect", () => {
//     console.log("Socket connected");
//     // Rejoin all active chats on reconnect
//     store.getState().activeChats.forEach((chat) => {
//       socket.emit("joinChat", chat._id);
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("Socket disconnected");
//   });

//   socket.on("newMessage", (message) => {
//     store.getState().handleNewMessage(message);
//   });

//   socket.on("messageSeen", ({ messageId }) => {
//     store.getState().updateMessageStatus(messageId);
//   });

//   socket.on("chatStatusChanged", ({ chatId, isActive }) => {
//     store.getState().handleChatStatusChange(chatId, isActive);
//   });

//   socket.on("error", (error) => {
//     console.error("Socket error:", error);
//   });
// };
