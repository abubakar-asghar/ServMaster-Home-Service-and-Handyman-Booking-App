import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * @desc    Get all chats for the logged-in user
 * @route   GET /api/chats
 * @access  Private
 */
export const getAllChats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({
    "participants.user": userId,
  })
    .populate("participants.user", "fullName phone profile_image")
    .populate("lastMessage");

  res.status(200).json({ success: true, chats });
});

/**
 * @desc    Create a new chat or return existing one
 * @route   POST /api/chats
 * @access  Private
 */
export const createOrFetchChat = asyncHandler(async (req, res, next) => {
  const { participantId, participantType } = req.body;

  if (!participantId || !participantType) {
    return next(new ErrorHandler("Participant ID and type are required", 400));
  }

  const currentUser = {
    user: req.user._id,
    participantType: req.user.role,
  };

  const otherParticipant = {
    user: participantId,
    participantType,
  };

  const existingChat = await Chat.findOne({
    participants: {
      $all: [{ $elemMatch: currentUser }, { $elemMatch: otherParticipant }],
    },
  })
    .populate("participants.user", "name email profile_image")
    .populate("lastMessage");

  if (existingChat) {
    return res.status(200).json({ success: true, chat: existingChat });
  }

  const chat = await Chat.create({
    participants: [currentUser, otherParticipant],
  });

  const populatedChat = await Chat.findById(chat._id).populate(
    "participants.user",
    "name email profile_image"
  );

  res.status(201).json({ success: true, chat: populatedChat });
});

/**
 * @desc    Send a message in a chat
 * @route   POST /api/chats/:chatId/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { text, image, file } = req.body;

  if (!text && !image && !file) {
    return next(new ErrorHandler("Message must have content", 400));
  }

  const chatExists = await Chat.exists({ _id: chatId });
  if (!chatExists) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  const message = await Message.create({
    sender: req.user._id,
    senderType: req.user.role,
    chat: chatId,
    text,
    image,
    file,
  });

  await Chat.findByIdAndUpdate(chatId, {
    $push: { messages: message._id },
    lastMessage: message._id,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name profile_image"
  );

  res.status(201).json({ success: true, message: populatedMessage });
});

/**
 * @desc    Get all messages from a chat
 * @route   GET /api/chats/:chatId/messages
 * @access  Private
 */
export const getChatMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "name profile_image"
  );

  res.status(200).json({ sucfcess: true, messages });
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

// // Pass `io` from server.js
// export const sendMessageWithSocket = (io) =>
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

//     // Create message
//     const message = await Message.create({
//       sender: req.user._id,
//       senderType: req.user.role,
//       chat: chatId,
//       text,
//       image,
//       file,
//     });

//     // Update chat
//     chat.messages.push(message._id);
//     chat.lastMessage = message._id;
//     await chat.save();

//     // Populate sender details
//     const populatedMessage = await Message.findById(message._id).populate(
//       "sender",
//       "name profile_image"
//     );

//     // Emit to the chat room
//     io.to(chatId).emit("newMessage", populatedMessage);

//     res.status(201).json({
//       success: true,
//       message: populatedMessage,
//     });
//   });
