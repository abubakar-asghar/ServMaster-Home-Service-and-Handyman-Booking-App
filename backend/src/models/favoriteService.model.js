import mongoose from "mongoose";

const favoriteServiceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness
favoriteServiceSchema.index({ customer: 1, service: 1 }, { unique: true });

const FavoriteService = mongoose.model(
  "FavoriteService",
  favoriteServiceSchema
);
export default FavoriteService;
