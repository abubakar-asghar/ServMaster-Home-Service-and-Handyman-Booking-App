import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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
    enum: ["super_admin", "moderator"],
    default: "moderator",
  },
  permissions: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
