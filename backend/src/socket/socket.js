import { Server } from "socket.io";
import http from "http";
import express from "express";
import ServiceProvider from "../models/serviceProvider.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update with your actual frontend origin if needed
    methods: ["GET", "POST"],
  },
});

// Track connected providers
const connectedProviders = new Map();

app.set("io", io);

// Socket Logic
io.on("connection", (socket) => {
  console.log("⚡ New socket connected:", socket.id);

  // Handle provider online status
  socket.on("providerOnline", async ({ providerId }) => {
    try {
      // Update database status
      const provider = await ServiceProvider.findByIdAndUpdate(
        providerId,
        {
          onlineStatus: "online",
          lastSeen: null,
        },
        { new: true }
      );

      // Track the socket connection
      connectedProviders.set(providerId, socket.id);
      socket.providerId = providerId;

      console.log(`🟢 Provider ${providerId} is now online`);

      // Broadcast to all clients that this provider is online
      io.emit("providerStatusChanged", {
        providerId,
        status: "online",
      });
    } catch (error) {
      console.error("Error updating provider online status:", error);
    }
  });

  // Handle periodic online pings
  socket.on("providerHeartbeat", async ({ providerId }) => {
    if (connectedProviders.has(providerId)) {
      // Just update lastSeen to keep provider active
      await ServiceProvider.findByIdAndUpdate(
        providerId,
        { lastSeen: null },
        { new: true }
      );
    }
  });

  // Join specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`🟢 User joined chat room: ${chatId}`);
  });

  // Message sender
  socket.on("sendMessage", (message) => {
    const chatId = message?.chat;
    if (chatId) {
      socket.to(chatId).emit("newMessage", message);
      console.log("📨 Message sent to chat:", chatId);
    }
  });

  socket.on("disconnect", async () => {
    console.log("🚪 User disconnected:", socket.id);

    // Handle provider going offline
    if (socket.providerId) {
      const providerId = socket.providerId;
      connectedProviders.delete(providerId);

      // Update database status
      try {
        await ServiceProvider.findByIdAndUpdate(providerId, {
          onlineStatus: "offline",
          lastSeen: new Date(),
        });

        console.log(`🔴 Provider ${providerId} is now offline`);

        // Broadcast to all clients that this provider is offline
        io.emit("providerStatusChanged", {
          providerId,
          status: "offline",
        });
      } catch (error) {
        console.error("Error updating provider offline status:", error);
      }
    }
  });
});

// Health Check
app.get("/", (req, res) => {
  res.send(
    "Server is running with real-time chat and provider status tracking!"
  );
});

// Helper function to get online providers
export const getOnlineProviders = () => {
  return Array.from(connectedProviders.keys());
};

export { app, io, server };
