import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Service category name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description must not exceed 500 characters"],
  },
  icon: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => /^https?:\/\/\S+$/.test(v),
      message: "Invalid URL format for icon",
    },
  },
  created_at: { type: Date, default: Date.now },
});

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);
export default ServiceCategory;
