import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
// import http from "http";
// import { Server } from "socket.io";

const app = express();

import errorMiddleware from "./middlewares/errorMiddleware.js";

// const allowedOrigins = [
//   "http://localhost:3000", // Admin panel (Next.js)
//   "http://localhost:19006", // Expo dev tools
//   "http://localhost:19000", // Expo web preview
//   "exp://192.168.1.x:19000", // Expo Go app on device
//   "http://192.168.1.x:8081", // Metro bundler on LAN
//   "http://192.168.0.104:5000", // Metro bundler on LAN
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // if you're using cookies (optional)
//   })
// );

app.use(express.json());
app.use(cookieParser());
// Logger Middleware
app.use(morgan("combined"));

// Routes Imports
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import serviceProviderRoutes from "./routes/serviceProvider.routes.js";
import serviceCategoryRoutes from "./routes/serviceCategory.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import chatRoutes from "./routes/chat.routes.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chats", chatRoutes);

// Middleware for Errors
app.use(errorMiddleware);

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("⚡ New User Connected:", socket.id);

//   socket.on("joinChat", (chatId) => {
//     socket.join(chatId);
//     console.log(`User joined chat: ${chatId}`);
//   });

//   socket.on("sendMessage", (messageData) => {
//     const { chatId, message } = messageData;
//     io.to(chatId).emit("newMessage", message);
//   });

//   socket.on("disconnect", () => {
//     console.log("🚪 User Disconnected:", socket.id);
//   });
// });

// export default server;

// Change this to server when using socket.io
export default app;
