import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
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
  created_at: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
