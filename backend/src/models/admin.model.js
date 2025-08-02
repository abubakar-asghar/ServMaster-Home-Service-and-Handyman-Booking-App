import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/.+\@.+\..+/, "Invalid email format"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Moderator"],
      default: "Moderator",
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
