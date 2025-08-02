import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{11}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    profileImage: {
      type: String,
      default: "default-profile.jpg",
    },
    accountStatus: {
      type: String,
      enum: {
        values: ["pending", "verified", "suspended", "inactive", "rejected"],
        message: "Invalid account status",
      },
      default: "pending",
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    personalInfo: {
      whatsapp: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^[0-9]{10,15}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid WhatsApp number!`,
        },
      },
      email: {
        type: String,
        lowercase: true,
        validate: {
          validator: function (v) {
            return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
        default: "prefer_not_to_say",
      },
    },
    businessInfo: {
      type: {
        type: String,
        enum: ["individual", "business"],
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Business name cannot exceed 100 characters"],
      },
      description: {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"],
      },
      hasPhysicalShop: {
        type: Boolean,
        default: false,
      },
      address: {
        type: String,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      city: {
        type: String,
      },
      workingDays: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
      workingHours: {
        startTime: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid time format (HH:MM)!`,
          },
        },
        endTime: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid time format (HH:MM)!`,
          },
        },
      },
    },
    verification: {
      identity: {
        cnicNumber: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid CNIC format (XXXXX-XXXXXXX-X)!`,
          },
        },
        cnicFront: { type: String },
        cnicBack: { type: String },
        selfie: { type: String },
        status: {
          type: String,
          enum: ["pending", "submitted", "verified", "rejected"],
          default: "pending",
        },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },
      },
      professional: {
        experienceYears: {
          type: Number,
          min: [0, "Experience cannot be negative"],
        },
        education: {
          type: String,
          min: 0,
          max: 200,
        },
        certification: {
          name: String,
          issuingOrganization: String,
          yearObtained: Number,
        },
        status: {
          type: String,
          enum: ["pending", "submitted", "verified", "rejected"],
          default: "pending",
        },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },
      },
    },
    selectedServices: [
      {
        _id: false,
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceCategory",
          // required: true,
        },
        services: [
          {
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
                default: "negotiable",
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
                default: "PKR",
              },
              notes: {
                type: String,
                maxlength: 200,
                default: "",
              },
            },
            rating: {
              average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
              },
              count: {
                type: Number,
                default: 0,
              },
            },
            available: {
              type: Boolean,
              default: true,
            },
            addedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (v) {
            return (
              !v ||
              (v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90)
            );
          },
          message: (props) =>
            `${props.value} is not a valid [longitude, latitude] pair!`,
        },
      },
    },
    serviceArea: {
      type: {
        type: String,
        enum: ["radius", "cities", "states", "country"],
        required: true,
        default: "radius",
      },
      radiusInMeters: {
        type: Number,
        default: 5000,
        min: 100,
        max: 50000,
      },
      cities: [String], // e.g., ["Lahore", "Islamabad"]
      states: [String], // e.g., ["Punjab", "Sindh"]
      country: {
        type: String,
        default: "Pakistan",
      },
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot exceed 5"],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    role: {
      type: String,
      required: true,
      default: "ServiceProvider",
    },
    onlineStatus: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
    },
    expoPushToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ location: "2dsphere" });

// Helper function to check if all identity verification fields are filled
const isIdentityComplete = (identity) => {
  return (
    identity.cnicNumber &&
    identity.cnicFront &&
    identity.cnicBack &&
    identity.selfie
  );
};

// Helper function to check if all professional verification fields are filled
const isProfessionalComplete = (professional) => {
  return (
    professional.experienceYears !== undefined &&
    professional.education &&
    professional.certification?.name &&
    professional.certification?.issuingOrganization &&
    professional.certification?.yearObtained !== undefined
  );
};

// Pre-save middleware to handle verification status updates
serviceProviderSchema.pre("save", function (next) {
  // Only proceed if verification fields are modified
  const identityModified = this.isModified("verification.identity");
  const professionalModified = this.isModified("verification.professional");

  if (identityModified || professionalModified) {
    // Check identity verification
    if (identityModified) {
      const identity = this.verification.identity;

      // If rejected and user submits new documents, change back to submitted
      if (identity.status === "rejected" && isIdentityComplete(identity)) {
        identity.status = "submitted";
        identity.verifiedAt = undefined;
        console.log(
          "Identity verification status updated from rejected to submitted"
        );
      }
      // If pending and all fields complete, change to submitted
      else if (identity.status === "pending" && isIdentityComplete(identity)) {
        identity.status = "submitted";
        console.log("Identity verification status updated to submitted");
      }
    }

    // Check professional verification
    if (professionalModified) {
      const professional = this.verification.professional;

      // If rejected and user submits new details, change back to submitted
      if (
        professional.status === "rejected" &&
        isProfessionalComplete(professional)
      ) {
        professional.status = "submitted";
        professional.verifiedAt = undefined;
        console.log(
          "Professional verification status updated from rejected to submitted"
        );
      }
      // If pending and all fields complete, change to submitted
      else if (
        professional.status === "pending" &&
        isProfessionalComplete(professional)
      ) {
        professional.status = "submitted";
        console.log("Professional verification status updated to submitted");
      }
    }
  }

  next();
});

// Pre-update middleware for findOneAndUpdate operations
serviceProviderSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const conditions = this.getQuery();

  // Helper to detect if any verification fields are being updated
  const isVerificationUpdate = () => {
    return Object.keys(update).some(
      (key) =>
        key.startsWith("verification.identity.") ||
        key.startsWith("verification.professional.")
    );
  };

  if (isVerificationUpdate()) {
    // Need to fetch the document to check current state
    this.model
      .findOne(conditions)
      .then((doc) => {
        if (!doc) return next();

        const updateOps = {};
        const identity = {
          ...doc.verification.identity.toObject(),
          ...update.$set?.verification?.identity,
          ...update.verification?.identity,
        };
        const professional = {
          ...doc.verification.professional.toObject(),
          ...update.$set?.verification?.professional,
          ...update.verification?.professional,
        };

        // Handle identity verification status
        if (
          doc.isModified("verification.identity") ||
          update.$set?.["verification.identity"]
        ) {
          if (
            (identity.status === "rejected" || identity.status === "pending") &&
            isIdentityComplete(identity)
          ) {
            updateOps["verification.identity.status"] = "submitted";
            updateOps["verification.identity.verifiedAt"] = undefined;
          }
        }

        // Handle professional verification status
        if (
          doc.isModified("verification.professional") ||
          update.$set?.["verification.professional"]
        ) {
          if (
            (professional.status === "rejected" ||
              professional.status === "pending") &&
            isProfessionalComplete(professional)
          ) {
            updateOps["verification.professional.status"] = "submitted";
            updateOps["verification.professional.verifiedAt"] = undefined;
          }
        }

        // Apply updates if needed
        if (Object.keys(updateOps).length > 0) {
          this.updateOne({}, { $set: updateOps }).exec();
        }

        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

// Core rating calculation methods
serviceProviderSchema.methods.calculateNewRating = function (
  currentAverage,
  currentCount,
  oldRating,
  newRating,
  action
) {
  let newAverage = currentAverage;
  let newCount = currentCount;

  switch (action) {
    case "create":
      newAverage =
        (currentAverage * currentCount + newRating) / (currentCount + 1);
      newCount = currentCount + 1;
      break;

    case "update":
      newAverage =
        (currentAverage * currentCount - oldRating + newRating) / currentCount;
      break;

    case "delete":
      if (currentCount <= 1) {
        newAverage = 0;
        newCount = 0;
      } else {
        newAverage =
          (currentAverage * currentCount - oldRating) / (currentCount - 1);
        newCount = currentCount - 1;
      }
      break;
  }

  return { newAverage, newCount };
};

// Main rating handler
serviceProviderSchema.statics.handleRatingUpdate = async function (
  providerId,
  serviceId,
  oldRating,
  newRating,
  action
) {
  const provider = await this.findById(providerId);
  if (!provider) {
    throw new Error("Provider not found");
  }

  // Validate inputs
  if (action !== "create" && (oldRating === null || oldRating === undefined)) {
    throw new Error("Old rating required for update or delete");
  }

  // Update provider overall rating
  const providerCalc = provider.calculateNewRating(
    provider.rating.average,
    provider.rating.count,
    oldRating,
    newRating,
    action
  );
  provider.rating.average = providerCalc.newAverage;
  provider.rating.count = providerCalc.newCount;

  // Update service rating if service exists
  if (serviceId) {
    let serviceUpdated = false;

    for (const category of provider.selectedServices) {
      const service = category.services.find((s) =>
        s.service.equals(serviceId)
      );
      if (service) {
        const serviceCalc = provider.calculateNewRating(
          service.rating.average,
          service.rating.count,
          oldRating,
          newRating,
          action
        );
        service.rating.average = serviceCalc.newAverage;
        service.rating.count = serviceCalc.newCount;
        serviceUpdated = true;
        break;
      }
    }

    if (!serviceUpdated) {
      console.log(
        `Service ${serviceId} not found for provider ${providerId}, skipping service rating update`
      );
    }
  }

  await provider.save();
  return provider;
};

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

export default ServiceProvider;
