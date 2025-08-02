import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.participantType",
        },
        participantType: {
          type: String,
          enum: ["Customer", "ServiceProvider"],
          required: true,
        },
      },
    ],
    activeServiceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: null,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isActive: {
      type: Boolean,
      default: false, // ❌ can't chat until activated
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
