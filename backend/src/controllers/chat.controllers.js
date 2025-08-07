import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * @desc    Get all chats for the logged-in Provider
 * @route   GET /api/chats/provider
 * @access  Private
 */
export const getAllProviderChats = asyncHandler(async (req, res, next) => {
  const userId = req.serviceProvider._id;

  const chats = await Chat.find({
    "participants.user": userId,
  })
    .populate("participants.user", "fullName phone profileImage")
    .populate("lastMessage");

  res.status(200).json({
    success: true,
    message: "Chats fetched successfully",
    data: chats,
  });
});

/**
 * @desc    Get all chats for the logged-in customer
 * @route   GET /api/chats/customer
 * @access  Private
 */
export const getAllCustomerChats = asyncHandler(async (req, res, next) => {
  const userId = req.customer._id;

  const chats = await Chat.find({
    "participants.user": userId,
  })
    .populate("participants.user", "fullName phone profileImage")
    .populate("lastMessage");

  res.status(200).json({
    success: true,
    message: "Chats fetched successfully",
    data: chats,
  });
});

/**
 * @desc    Create a new chat or return existing one
 * @route   POST /api/chats
 * @access  Private
 */
export const createOrFetchChat = asyncHandler(async (req, res, next) => {
  const { participantId, participantType, serviceRequestId } = req.body;

  if (!participantId || !participantType || !serviceRequestId) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const currentUser = {
    user: req.user._id,
    participantType: req.user.role,
  };

  const otherParticipant = {
    user: participantId,
    participantType,
  };

  // Look for existing chat between the same participants
  let chat = await Chat.findOne({
    participants: {
      $all: [{ $elemMatch: currentUser }, { $elemMatch: otherParticipant }],
    },
  }).populate("participants.user", "fullName phone profileImage");

  if (!chat) {
    // Create new chat
    chat = await Chat.create({
      participants: [currentUser, otherParticipant],
      activeServiceRequest: serviceRequestId,
      isActive: true,
    });
  } else {
    // Update existing chat to set new service request and mark it active again
    chat.activeServiceRequest = serviceRequestId;
    chat.isActive = true;
    await chat.save();
  }

  const populatedChat = await Chat.findById(chat._id)
    .populate("participants.user", "fullName phone profileImage")
    .populate("lastMessage");

  res.status(200).json({ success: true, data: populatedChat });
});

/**
 * @desc    Send a message in a chat
 * @route   POST /api/chats/:chatId/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { text, image, file } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler(404, "Chat not found"));
  if (!chat.isActive)
    return next(new ErrorHandler(403, "Chat session is inactive"));
  if (!chat.activeServiceRequest)
    return next(
      new ErrorHandler(400, "No active service request for this chat")
    );

  if (!text && !image && !file) {
    return next(new ErrorHandler(400, "Message must have content"));
  }

  const message = await Message.create({
    sender: req.user._id,
    senderType: req.user.role,
    chat: chatId,
    text,
    image,
    file,
    serviceRequest: chat.activeServiceRequest,
  });

  // Update chat with message
  chat.messages.push(message._id);
  chat.lastMessage = message._id;
  await chat.save();

  const populatedMessage = await Message.findById(message._id);

  res.status(201).json({ success: true, data: populatedMessage });
});

/**
 * @desc    Get all messages from a chat
 * @route   GET /api/chats/messages/:chatId
 * @access  Private
 */
export const getChatMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId });

  if (!messages) {
    res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({ success: true, data: messages });
});

/**
 * @desc    Delete a chat and its messages (Admin)
 * @route   DELETE /api/chats/:chatId
 * @access  Private (Admin only)
 */
export const deleteChatAndMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  await Chat.findByIdAndDelete(chatId);
  await Message.deleteMany({ chat: chatId });

  res
    .status(200)
    .json({ success: true, message: "Chat and messages deleted successfully" });
});

export const sendMessageWithSocket = (io) =>
  asyncHandler(async (req, res, next) => {
    const { chatId } = req.params;
    const { text, image, file } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandler(404, "Chat not found"));
    if (!chat.isActive)
      return next(new ErrorHandler(403, "Chat session is inactive"));
    if (!chat.activeServiceRequest)
      return next(
        new ErrorHandler(400, "No active service request for this chat")
      );
    if (!text && !image && !file) {
      return next(new ErrorHandler(400, "Message must have content"));
    }

    // Create and store message
    const message = await Message.create({
      sender: req.user._id,
      senderType: req.user.role,
      chat: chatId,
      text,
      image,
      file,
      serviceRequest: chat.activeServiceRequest,
    });

    console.log(message)

    // Update chat
    chat.messages.push(message._id);
    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id);

    // Emit message to all users in this chat room
    io.to(chatId).emit("newMessage", populatedMessage);

    res.status(201).json({ success: true, data: populatedMessage });
  });
