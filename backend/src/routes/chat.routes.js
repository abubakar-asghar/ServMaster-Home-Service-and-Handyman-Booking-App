import { Router } from "express";
import {
  createOrGetChat,
  getChats,
  sendMessage,
  getMessages,
  deleteChat,
} from "../controllers/chat.controllers.js";

const router = Router();

router.route("/message").post(sendMessage);
router.route("/messages/:chatId").get(getMessages);
router.route("/").post(createOrGetChat).get(getChats);
router.route("/:chatId").delete(deleteChat);

export default router;
