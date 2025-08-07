import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "src/.env" });

import express from "express";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import { app, io, server } from "./socket/socket.js";

// Connect DB
import connectDB from "./config/db.js";
connectDB();

// Middleware
app.use(express.json());
app.use(morgan("combined"));
app.use(
  cors({
    origin: "*", // You can tighten this based on your frontend URLs
    credentials: true,
  })
);

// Route Imports
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import serviceProviderRoutes from "./routes/serviceProvider.routes.js";
import serviceCategoryRoutes from "./routes/serviceCategory.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import serviceRequestRoutes from "./routes/serviceRequest.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import chatRoutes, {
  configureChatRoutesWithSocket,
} from "./routes/chat.routes.js";

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
configureChatRoutesWithSocket(io);

// Error Middleware
app.use(errorMiddleware);

// Handle Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

app.get("/", (req, res) => {
  res.send("Server is running.");
});

// Start Server
server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server listening on http://localhost:${process.env.PORT}`);
});

// Handle Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
