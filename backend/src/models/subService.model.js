import mongoose from "mongoose";

const subServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Sub-service name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description must not exceed 500 characters"],
  },
  parent_service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: [true, "Parent service ID is required"],
  },
  created_at: { type: Date, default: Date.now },
});

const SubService = mongoose.model("SubService", subServiceSchema);
export default SubService;
