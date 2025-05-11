import mongoose from "mongoose";

// Utility function to convert name to slug
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
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

// Middleware to generate slug before saving
serviceSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
