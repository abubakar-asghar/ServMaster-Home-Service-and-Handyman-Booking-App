import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "Phone number is required"],
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
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere",
    },
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  created_at: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
