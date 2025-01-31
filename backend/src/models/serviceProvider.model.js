import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    match: [/.+\@.+\..+/, "Invalid email format"],
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "Phone number is required"],
    match: [/^\d{10,15}$/, "Invalid phone number format"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  profile_image: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => /^https?:\/\/\S+$/.test(v),
      message: "Invalid URL format for profile image",
    },
  },
  service_types: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: [true, "At least one service type is required"],
    },
  ],
  sub_services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubService",
      required: [true, "At least one sub-service is required"],
    },
  ],
  experience: {
    type: Number,
    min: [0, "Experience must be at least 0 years"],
    max: [50, "Experience must not exceed 50 years"],
  },
  previous_work_images: [
    {
      type: String,
      validate: {
        validator: (v) => /^https?:\/\/\S+$/.test(v),
        message: "Invalid URL format for work image",
      },
    },
  ],
  certifications: [{ type: String, trim: true }],
  cnic_number: {
    type: String,
    unique: true,
    required: [true, "CNIC number is required"],
    match: [/^\d{13}$/, "Invalid CNIC format"],
  },
  cnic_images: [
    {
      type: String,
      validate: {
        validator: (v) => /^https?:\/\/\S+$/.test(v),
        message: "Invalid URL format for CNIC image",
      },
    },
  ],
  selfie_image: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => /^https?:\/\/\S+$/.test(v),
      message: "Invalid URL format for selfie image",
    },
  },
  is_verified: { type: Boolean, default: false },
  is_approved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);
export default ServiceProvider;
