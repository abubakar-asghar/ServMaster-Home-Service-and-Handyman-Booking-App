// socket/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import Customer from "../models/customer.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const connectedUsers = new Map();
app.set("io", io);

// 🔁 Reusable helper to set online status
const setUserOnlineStatus = async (userId, userType) => {
  if (userType === "ServiceProvider") {
    return await ServiceProvider.findByIdAndUpdate(userId, {
      onlineStatus: "online",
    });
  } else if (userType === "Customer") {
    return await Customer.findByIdAndUpdate(userId, {
      onlineStatus: "online",
    });
  }
};

// 🔁 Reusable helper to set offline status
const setUserOfflineStatus = async (userId, userType) => {
  if (userType === "ServiceProvider") {
    return await ServiceProvider.findByIdAndUpdate(userId, {
      onlineStatus: "offline",
      lastSeen: new Date(),
    });
  } else if (userType === "Customer") {
    return await Customer.findByIdAndUpdate(userId, {
      onlineStatus: "offline",
      lastSeen: new Date(),
    });
  }
};

// ✅ Socket Logic
io.on("connection", (socket) => {
  console.log("⚡ New socket connection:", socket.id);

  socket.on("authenticate", async ({ userId, token, userType }) => {
    try {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.userType = userType;

      const user = await setUserOnlineStatus(userId, userType);
      console.log(`🔐 ${userType} ${userId} is online`);

      // Notify clients (e.g. for real-time status update)
      io.emit("userStatusChanged", {
        userId,
        userType,
        status: "online",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      socket.disconnect();
    }
  });

  socket.on("joinChat", async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || !socket.userId) throw new Error("Unauthorized chat access");

      const isParticipant = chat.participants.some(
        (p) => p.user.toString() === socket.userId
      );
      if (!isParticipant) throw new Error("User is not a chat participant");

      socket.join(chatId);
      console.log(`💬 User ${socket.userId} joined chat ${chatId}`);

      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: socket.userId },
          seen: false,
        },
        { $set: { seen: true } }
      );

      socket.to(chatId).emit("messagesSeen", { chatId });
    } catch (error) {
      console.error("Error joining chat:", error.message);
    }
  });

  socket.on("sendMessage", async (messageData) => {
    try {
      console.log(messageData)

      const { chatId, content } = messageData;

      const chat = await Chat.findById(chatId);
      if (!chat || !socket.userId) throw new Error("Invalid chat");

      const isParticipant = chat.participants.some(
        (p) => p.user.toString() === socket.userId
      );
      if (!isParticipant) throw new Error("Unauthorized");

      const newMessage = new Message({
        chat: chatId,
        sender: socket.userId,
        senderType: content.senderType,
        text: content.text,
        serviceRequest: chat.activeServiceRequest,
        seen: false,
      });

      const savedMessage = await newMessage.save();

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: savedMessage._id,
        updatedAt: new Date(),
      });

      io.to(chatId).emit("newMessage", {
        ...savedMessage.toObject(),
        source: "server",
        tempId: messageData.tempId,
      });

      chat.participants.forEach((participant) => {
        if (participant.user.toString() !== socket.userId) {
          const targetSocketId = connectedUsers.get(
            participant.user.toString()
          );
          if (targetSocketId) {
            io.to(targetSocketId).emit("newMessageNotification", {
              chatId,
              message: savedMessage,
            });
          }
        }
      });

      console.log(`📩 Message sent in chat ${chatId} by ${socket.userId}`);
    } catch (error) {
      console.error("Error sending message:", error.message);
      socket.emit("messageError", { error: error.message });
    }
  });

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
      socket.to(chatId).emit("messagesSeen", { chatId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  socket.on("disconnect", async () => {
    console.log("🚪 Disconnected:", socket.id);

    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      try {
        await setUserOfflineStatus(socket.userId, socket.userType);
        console.log(`🔌 ${socket.userType} ${socket.userId} is offline`);

        io.emit("userStatusChanged", {
          userId: socket.userId,
          userType: socket.userType,
          status: "offline",
        });
      } catch (error) {
        console.error("Error setting offline status:", error);
      }
    }
  });
});

// Health Check
app.get("/socket-health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    connections: connectedUsers.size,
    uptime: process.uptime(),
  });
});

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
