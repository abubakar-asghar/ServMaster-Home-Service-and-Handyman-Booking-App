import mongoose from "mongoose";

const favoriteProviderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness: one provider can only be favorited once per customer
favoriteProviderSchema.index({ customer: 1, provider: 1 }, { unique: true });

const FavoriteProvider = mongoose.model(
  "FavoriteProvider",
  favoriteProviderSchema
);
export default FavoriteProvider;
