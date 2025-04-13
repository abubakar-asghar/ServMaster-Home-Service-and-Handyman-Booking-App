import mongoose from "mongoose";

// Utility function to convert name to slug
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Service category name is required"],
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
  icon: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => /^https?:\/\/\S+$/.test(v),
      message: "Invalid URL format for icon",
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to generate slug before saving
serviceCategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

export default ServiceCategory;
