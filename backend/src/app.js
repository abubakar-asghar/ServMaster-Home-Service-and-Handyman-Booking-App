import express from "express";
import cookieParser from "cookie-parser";
// import http from "http";
// import { Server } from "socket.io";

const app = express();

import errorMiddleware from "./middlewares/errorMiddleware.js";

app.use(express.json());
app.use(cookieParser());

// Routes Imports
import adminRoutes from "./routes/admin.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import serviceProviderRoutes from "./routes/serviceprovider.routes.js";
import serviceCategoryRoutes from "./routes/servicecategory.routes.js";
import subServiceRoutes from "./routes/subservice.routes.js";
import serviceRequestRoutes from "./routes/servicerequest.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import chatRoutes from "./routes/chat.routes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/sub-services", subServiceRoutes);
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
