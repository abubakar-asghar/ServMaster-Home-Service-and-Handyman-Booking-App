import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    service_request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);
// Track creation state explicitly
reviewSchema.pre("save", function (next) {
  this._isNew = this.isNew; // Capture creation state before save
  next();
});

// Post-save hook - handles new creations
reviewSchema.post("save", async function (doc) {
  console.log("Post-save hook triggered");

  // Use the captured creation state
  if (this._isNew) {
    console.log("New review creation detected");
    try {
      await mongoose
        .model("ServiceProvider")
        .handleRatingUpdate(
          doc.service_provider,
          doc.service,
          null,
          doc.rating,
          "create"
        );
      console.log("Provider ratings updated after creation");
    } catch (error) {
      console.error("Creation rating update failed:", error);
    }
  }
});

// Pre-save hook - handles updates only
reviewSchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered");

  // Skip if this is a new document
  if (this.isNew) {
    return next();
  }

  // Only process rating updates
  if (this.isModified("rating")) {
    console.log("Review update with rating change detected");
    try {
      const oldReview = await this.constructor.findById(this._id);
      if (oldReview) {
        await mongoose
          .model("ServiceProvider")
          .handleRatingUpdate(
            this.service_provider,
            this.service,
            oldReview.rating,
            this.rating,
            "update"
          );
        console.log("Provider ratings updated after review update");
      }
    } catch (error) {
      console.error("Update rating update failed:", error);
      throw error;
    }
  }
  next();
});

// Pre-delete hook for review deletion
reviewSchema.pre("deleteOne", { document: true }, async function () {
  console.log("The review comes deleteOne");
  try {
    await mongoose
      .model("ServiceProvider")
      .handleRatingUpdate(
        this.service_provider,
        this.service,
        this.rating,
        null,
        "delete"
      );
  } catch (error) {
    console.error("Error updating ratings before deletion:", error);
    throw error;
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
