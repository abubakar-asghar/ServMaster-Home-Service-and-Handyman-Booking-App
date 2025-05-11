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
    accountStatus: {
      type: String,
      enum: {
        values: ["pending", "verified", "active", "suspended"],
        message: "Invalid account status",
      },
      default: "pending",
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
      profileImage: {
        type: String,
        default: "default-profile.jpg",
      },
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
      phone: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
      },
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
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        verifiedAt: { type: Date },
      },
      professional: {
        experienceYears: {
          type: Number,
          min: [0, "Experience cannot be negative"],
        },
        certifications: [
          {
            name: String,
            issuingOrganization: String,
            yearObtained: Number,
          },
        ],
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    },
    services: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceCategory",
          // required: true,
        },
        subServices: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
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
    serviceRadius: {
      type: Number,
      default: 5000,
      min: [100, "Service radius must be at least 100 meters"],
      max: [50000, "Service radius cannot exceed 50km"],
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
  },
  { timestamps: true }
);

serviceProviderSchema.index({ location: "2dsphere" });

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  serviceProviderSchema
);

export default ServiceProvider;
