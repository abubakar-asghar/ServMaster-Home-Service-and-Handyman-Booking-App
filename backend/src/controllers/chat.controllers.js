import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Get all chats for a customer or service provider
// @route   GET /api/chats
// @access  Private (Customer & Service Provider)
export const getChats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
    .populate("participants", "name email profile_image")
    .populate("lastMessage");

  res.status(200).json({
    success: true,
    chats,
  });
});

// @desc    Create or Get existing chat between a customer and service provider
// @route   POST /api/chats
// @access  Private (Customer & Service Provider)
export const createOrGetChat = asyncHandler(async (req, res, next) => {
  const { serviceProviderId } = req.body;

  if (!serviceProviderId) {
    return next(new ErrorHandler("Service Provider ID is required", 400));
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [req.user._id, serviceProviderId] },
  }).populate("participants", "name email profile_image");

  if (existingChat) {
    return res.status(200).json({ success: true, chat: existingChat });
  }

  const newChat = await Chat.create({
    participants: [req.user._id, serviceProviderId],
  });

  res.status(201).json({
    success: true,
    chat: newChat,
  });
});

// @desc    Send message in chat
// @route   POST /api/chats/:chatId/messages
// @access  Private (Customer & Service Provider)
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { text, image, file } = req.body;

  if (!text && !image && !file) {
    return next(new ErrorHandler("Message cannot be empty", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  const message = await Message.create({
    sender: req.user._id,
    chat: chatId,
    text,
    image,
    file,
  });

  chat.lastMessage = message._id;
  await chat.save();

  res.status(201).json({
    success: true,
    message,
  });
});

// @desc    Get messages from a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private (Customer & Service Provider)
export const getMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "name profile_image"
  );

  res.status(200).json({
    success: true,
    messages,
  });
});

// @desc    Delete chat (Admin Only)
// @route   DELETE /api/chats/:chatId
// @access  Private (Admin)
export const deleteChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  await Chat.findByIdAndDelete(chatId);
  await Message.deleteMany({ chat: chatId });

  res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});



// // Pass `io` from server.js
// export const sendMessage = (io) =>
//   asyncHandler(async (req, res, next) => {
//     const { chatId } = req.params;
//     const { text, image, file } = req.body;

//     if (!text && !image && !file) {
//       return next(new ErrorHandler("Message cannot be empty", 400));
//     }

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return next(new ErrorHandler("Chat not found", 404));
//     }

//     const message = await Message.create({
//       sender: req.user._id,
//       chat: chatId,
//       text,
//       image,
//       file,
//     });

//     chat.lastMessage = message._id;
//     await chat.save();

//     // Emit new message event
//     io.to(chatId).emit("newMessage", message);

//     res.status(201).json({
//       success: true,
//       message,
//     });
//   });
