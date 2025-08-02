import { io } from "socket.io-client";

// ✅ Replace with your actual backend URL (adjust for LAN/production)
export const socket = io("http://192.168.0.104:5000", {
  autoConnect: false, // Don't connect immediately — connect only after login
  transports: ["websocket"],
  withCredentials: true,
});

// import { io } from "socket.io-client";
// import { Platform } from "react-native";

// // Configure socket connection
// const SOCKET_URL =
//   Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

// export const socket = io("http://192.168.0.104:5000", {
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
