import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    service_provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    pricing: {
      type: {
        type: String,
        enum: ["fixed", "per_hour", "per_day", "negotiable"],
        required: true,
      },
      amount: {
        type: Number,
        min: [0, "Price must be non-negative"],
        required: function () {
          return this.pricing.type !== "negotiable";
        },
      },
      currency: {
        type: String,
        enum: ["PKR", "USD"],
      },
      notes: {
        type: String,
        maxlength: 200,
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "declined"],
      default: "pending",
    },
    scheduled_time: { type: Date },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: "Pakistan" },
    location: {
      longitude: {
        type: Number,
        validate: {
          validator: function (v) {
            return v >= -180 && v <= 180;
          },
        },
      },
      latitude: {
        type: Number,
        validate: {
          validator: function (v) {
            return v >= -90 && v <= 90;
          },
        },
      },
    },
    customer_notes: { type: String, trim: true },
    cancellation: {
      cancelled_by: {
        type: String,
        enum: ["Customer", "ServiceProvider", "System"],
      },
      reason: {
        type: String,
        trim: true,
      },
      reason_type: {
        type: String,
        enum: [
          "schedule_conflict",
          "found_another_provider",
          "no_longer_needed",
          "price_issue",
          "location_too_far",
          "not_available_on_requested_date",
          "customer_unresponsive",
          "provider_unresponsive",
          "other",
        ],
      },
      cancelled_at: Date,
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
export default ServiceRequest;
