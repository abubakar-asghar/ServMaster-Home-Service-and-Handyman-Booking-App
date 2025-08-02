import { Router } from "express";
import {
  createOrFetchChat,
  getChatMessages,
  sendMessage,
  getAllCustomerChats,
  getAllProviderChats,
  deleteChatAndMessages,
  sendMessageWithSocket,
} from "../controllers/chat.controllers.js";

import {
  isAuthenticatedCustomer,
  isAuthenticatedServiceProvider,
  isAuthenticatedUser,
  isSuperAdmin,
} from "../middlewares/authMiddleware.js";

const router = Router();

// 🔐 Authenticated user sends message (standard HTTP)
router.route("/message/:chatId").post(isAuthenticatedUser, sendMessage);

// 🔐 Real-time message sending using socket-compatible controller
export const configureChatRoutesWithSocket = (io) => {
  router.post(
    "/socket-message/:chatId",
    isAuthenticatedUser,
    sendMessageWithSocket(io)
  );
};

// 🔐 Get messages of a chat
router.route("/messages/:chatId").get(isAuthenticatedUser, getChatMessages);

// 🔐 Create or get chat (Customer <-> Provider) with service request
router.route("/").post(isAuthenticatedUser, createOrFetchChat);

// 🔐 Get all chats by role
router.route("/customer").get(isAuthenticatedCustomer, getAllCustomerChats);
router
  .route("/provider")
  .get(isAuthenticatedServiceProvider, getAllProviderChats);

// 🔐 Admin-only chat + message deletion
router.route("/:chatId").delete(isSuperAdmin, deleteChatAndMessages);

export default router;
