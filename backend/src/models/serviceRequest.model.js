import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  service_provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true,
  },
  service_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true,
  },
  sub_service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubService",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
  },
  scheduled_time: { type: Date },
  customer_notes: { type: String, trim: true },
  created_at: { type: Date, default: Date.now },
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
export default ServiceRequest;
