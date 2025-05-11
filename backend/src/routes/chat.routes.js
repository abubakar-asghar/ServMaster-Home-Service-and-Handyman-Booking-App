import { Router } from "express";
import {
  createOrFetchChat,
  getChatMessages,
  sendMessage,
  getAllChats,
  deleteChatAndMessages,
} from "../controllers/chat.controllers.js";
import { isAuthenticatedUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/message").post(sendMessage);
router.route("/messages/:chatId").get(getChatMessages);
router.route("/").post(createOrFetchChat).get(isAuthenticatedUser, getAllChats);
router.route("/:chatId").delete(deleteChatAndMessages);

export default router;
