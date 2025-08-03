import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update with your client origin in production
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes recovery window
    skipMiddlewares: true,
  },
});

// Track connected users (both customers and providers)
const connectedUsers = new Map();

app.set("io", io);

// Socket Logic
io.on("connection", (socket) => {
  console.log("⚡ New socket connection:", socket.id);

  // Authenticate connection
  socket.on("authenticate", async ({ userId, token }) => {
    try {
      // Here you would verify the token (JWT verification)
      // For now we'll just store the user ID
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`🔐 User ${userId} authenticated`);
    } catch (error) {
      console.error("Authentication error:", error);
      socket.disconnect();
    }
  });

  // Join chat room handler
  socket.on("joinChat", async (chatId) => {
    try {
      // Verify user has access to this chat
      const chat = await Chat.findById(chatId);
      if (!chat || !socket.userId) {
        throw new Error("Unauthorized chat access");
      }

      // Check if user is participant
      const isParticipant = chat.participants.some(
        (p) => p.user.toString() === socket.userId
      );

      if (!isParticipant) {
        throw new Error("User is not a chat participant");
      }

      socket.join(chatId);
      console.log(`💬 User ${socket.userId} joined chat ${chatId}`);

      // Mark messages as seen when joining
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: socket.userId },
          seen: false,
        },
        { $set: { seen: true } }
      );

      // Notify other participants that messages were seen
      socket.to(chatId).emit("messagesSeen", { chatId });
    } catch (error) {
      console.error("Error joining chat:", error.message);
    }
  });

  // Message handler
  socket.on("sendMessage", async (messageData) => {
    try {
      const { chatId, content } = messageData;

      // Verify chat exists and user is participant
      const chat = await Chat.findById(chatId);
      if (!chat || !socket.userId) {
        throw new Error("Invalid chat or unauthorized");
      }

      const isParticipant = chat.participants.some(
        (p) => p.user.toString() === socket.userId
      );

      if (!isParticipant) {
        throw new Error("User is not a chat participant");
      }

      // Create and save message
      const newMessage = new Message({
        chat: chatId,
        sender: socket.userId,
        senderType: content.senderType, // "Customer" or "ServiceProvider"
        text: content.text,
        seen: false,
      });

      const savedMessage = await newMessage.save();

      // Update chat's last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: savedMessage._id,
        updatedAt: new Date(),
      });

      // Emit to all chat participants
      io.to(chatId).emit("newMessage", savedMessage);

      // Emit notification to other participants who aren't in the chat
      chat.participants.forEach((participant) => {
        if (participant.user.toString() !== socket.userId) {
          io.to(connectedUsers.get(participant.user.toString()))?.emit(
            "newMessageNotification",
            {
              chatId,
              message: savedMessage,
            }
          );
        }
      });

      console.log(`📩 Message sent to chat ${chatId} by ${socket.userId}`);
    } catch (error) {
      console.error("Error sending message:", error.message);
      socket.emit("messageError", { error: error.message });
    }
  });

  // Message received acknowledgment
  socket.on("messageReceived", async ({ chatId, messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        receivedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating message receipt:", error);
    }
  });

  // Message seen handler
  socket.on("markMessagesAsSeen", async ({ chatId }) => {
    try {
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: socket.userId },
          seen: false,
        },
        { $set: { seen: true, seenAt: new Date() } }
      );

      // Notify other participants
      socket.to(chatId).emit("messagesSeen", { chatId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  // Disconnection handler
  socket.on("disconnect", async () => {
    console.log("🚪 User disconnected:", socket.id);

    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      // For providers, update online status
      if (socket.userType === "ServiceProvider") {
        try {
          await ServiceProvider.findByIdAndUpdate(socket.userId, {
            onlineStatus: "offline",
            lastSeen: new Date(),
          });

          io.emit("providerStatusChanged", {
            providerId: socket.userId,
            status: "offline",
          });
        } catch (error) {
          console.error("Error updating provider status:", error);
        }
      }
    }
  });
});

// Health Check Endpoint
app.get("/socket-health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    connections: connectedUsers.size,
    uptime: process.uptime(),
  });
});

// Helper functions
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

export { app, io, server };
// import { Server } from "socket.io";
// import http from "http";
// import express from "express";
// import ServiceProvider from "../models/serviceProvider.model.js";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Update with your actual frontend origin if needed
//     methods: ["GET", "POST"],
//   },
// });

// // Track connected providers
// const connectedProviders = new Map();

// app.set("io", io);

// // Socket Logic
// io.on("connection", (socket) => {
//   console.log("⚡ New socket connected:", socket.id);

//   // Handle provider online status
//   socket.on("providerOnline", async ({ providerId }) => {
//     try {
//       // Update database status
//       const provider = await ServiceProvider.findByIdAndUpdate(
//         providerId,
//         {
//           onlineStatus: "online",
//           lastSeen: null,
//         },
//         { new: true }
//       );

//       // Track the socket connection
//       connectedProviders.set(providerId, socket.id);
//       socket.providerId = providerId;

//       console.log(`🟢 Provider ${providerId} is now online`);

//       // Broadcast to all clients that this provider is online
//       io.emit("providerStatusChanged", {
//         providerId,
//         status: "online",
//       });
//     } catch (error) {
//       console.error("Error updating provider online status:", error);
//     }
//   });

//   // Handle periodic online pings
//   socket.on("providerHeartbeat", async ({ providerId }) => {
//     if (connectedProviders.has(providerId)) {
//       // Just update lastSeen to keep provider active
//       await ServiceProvider.findByIdAndUpdate(
//         providerId,
//         { lastSeen: null },
//         { new: true }
//       );
//     }
//   });

//   // Join specific chat room
//   socket.on("joinChat", (chatId) => {
//     socket.join(chatId);
//     console.log(`🟢 User joined chat room: ${chatId}`);
//   });

//   // Message sender
//   socket.on("sendMessage", (message) => {
//     const chatId = message?.chat;
//     if (chatId) {
//       socket.to(chatId).emit("newMessage", message);
//       console.log("📨 Message sent to chat:", chatId);
//     }
//   });

//   socket.on("disconnect", async () => {
//     console.log("🚪 User disconnected:", socket.id);

//     // Handle provider going offline
//     if (socket.providerId) {
//       const providerId = socket.providerId;
//       connectedProviders.delete(providerId);

//       // Update database status
//       try {
//         await ServiceProvider.findByIdAndUpdate(providerId, {
//           onlineStatus: "offline",
//           lastSeen: new Date(),
//         });

//         console.log(`🔴 Provider ${providerId} is now offline`);

//         // Broadcast to all clients that this provider is offline
//         io.emit("providerStatusChanged", {
//           providerId,
//           status: "offline",
//         });
//       } catch (error) {
//         console.error("Error updating provider offline status:", error);
//       }
//     }
//   });
// });

// // Health Check
// app.get("/", (req, res) => {
//   res.send(
//     "Server is running with real-time chat and provider status tracking!"
//   );
// });

// // Helper function to get online providers
// export const getOnlineProviders = () => {
//   return Array.from(connectedProviders.keys());
// };

// export { app, io, server };
