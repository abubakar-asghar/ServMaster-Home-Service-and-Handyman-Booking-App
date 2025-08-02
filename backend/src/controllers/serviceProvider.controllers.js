import ServiceProvider from "../models/serviceProvider.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Review from "../models/review.model.js";
import Service from "../models/service.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { calculateDistance } from "../utils/calculateDistance.js";
import { workerData } from "worker_threads";

/**
 * @desc    Get provider profile for customer
 * @route   GET /api/service-providers/profile/:id
 * @access  Private
 */
export const getServiceProviderProfileForCustomer = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const provider = await ServiceProvider.findById(id)
      .select("-password")
      .populate([
        {
          path: "selectedServices.category",
          select: "name icon",
        },
        {
          path: "selectedServices.services.service",
          select: "name icon",
        },
      ]);

    if (!provider) return next(new ErrorHandler(404, "Provider not found"));

    const reviews = await Review.find({
      service_provider: id,
    })
      .populate("customer", "fullName profileImage")
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Provider profile fetched successfully",
        data: provider,
      });
    }

    const providerWithReviews = provider.toObject();
    providerWithReviews.reviews = reviews;

    console.log(providerWithReviews);

    res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      data: providerWithReviews,
    });
  }
);

/**
 * @desc    Get logged-in provider profile
 * @route   GET /api/service-providers/me
 * @access  Private
 */
export const getServiceProviderProfile = asyncHandler(
  async (req, res, next) => {
    const provider = req.serviceProvider;

    if (!provider) {
      return next(new ErrorHandler(404, "Provider not found"));
    }

    await provider.populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name icon",
      },
    ]);

    provider.password = undefined;

    res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      data: provider,
    });
  }
);

/**
 * @desc    Get service providers by service ID (only verified providers)
 * @route   PUT /api/service-providers/all/:serviceId
 * @access  Public
 */
export const getServiceProvidersByService = asyncHandler(
  async (req, res, next) => {
    const { serviceId } = req.params;
    const { lat, long, city, state } = req.query;

    // Validate service exists
    const service = await Service.findById(serviceId).populate(
      "parent_service"
    );
    if (!service) {
      return next(new ErrorHandler(404, "Service not found"));
    }

    // Get all VERIFIED providers offering this service
    let providers = await ServiceProvider.find({
      "selectedServices.services.service": service._id,
      accountStatus: "verified", // Only verified providers
    }).select("-password");

    if (!providers || providers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No verified providers found for this service",
        data: { providers: [], service: service.toObject() },
      });
    }

    // If location parameters provided, filter providers by service area
    if (lat && long) {
      const customerPoint = {
        type: "Point",
        coordinates: [parseFloat(long), parseFloat(lat)],
      };

      providers = providers.filter((provider) => {
        // Skip providers without location data
        if (
          !provider.location?.coordinates ||
          provider.location.coordinates.length !== 2
        ) {
          return false;
        }

        const providerPoint = {
          type: "Point",
          coordinates: provider.location.coordinates,
        };

        switch (provider.serviceArea.type) {
          case "radius":
            // Calculate distance between customer and provider in meters
            const distance = calculateDistance(
              customerPoint.coordinates[1], // lat
              customerPoint.coordinates[0], // long
              providerPoint.coordinates[1], // lat
              providerPoint.coordinates[0] // long
            );

            // Check if within provider's radius
            return distance <= (provider.serviceArea.radiusInMeters || 5000);

          case "cities":
            return city && provider.serviceArea.cities?.includes(city);

          case "states":
            return state && provider.serviceArea.states?.includes(state);

          case "country":
            return provider.serviceArea.country === "Pakistan"; // Default country

          default:
            return false;
        }
      });

      // Add distance to each provider for sorting
      providers = providers.map((provider) => {
        const providerPoint = {
          type: "Point",
          coordinates: provider.location.coordinates,
        };

        const distance = calculateDistance(
          customerPoint.coordinates[1],
          customerPoint.coordinates[0],
          providerPoint.coordinates[1],
          providerPoint.coordinates[0]
        );

        return {
          ...provider.toObject(),
          distance: distance / 1000, // Convert to km
        };
      });

      // Sort by online status first (online first), then by distance (nearest first)
      providers.sort((a, b) => {
        // Online status comparison (online comes first)
        if (a.onlineStatus === "online" && b.onlineStatus !== "online")
          return -1;
        if (a.onlineStatus !== "online" && b.onlineStatus === "online")
          return 1;

        // If same online status, sort by distance
        return a.distance - b.distance;
      });
    } else {
      // If no location parameters, just sort by online status
      providers.sort((a, b) => {
        if (a.onlineStatus === "online" && b.onlineStatus !== "online")
          return -1;
        if (a.onlineStatus !== "online" && b.onlineStatus === "online")
          return 1;
        return 0;
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Verified providers fetched successfully (sorted by online status)",
      data: {
        providers,
        service: service.toObject(),
        customerLocation: lat && long ? { lat, long, city, state } : null,
      },
    });
  }
);

// controllers/providerController.js
export const updateOnlineStatus = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const { status } = req.body;

  const provider = await ServiceProvider.findByIdAndUpdate(
    providerId,
    { 
      onlineStatus: status,
      lastSeen: status === 'online' ? null : new Date() 
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: provider
  });
});

/**
 * @desc    Update personal info
 * @route   PUT /api/service-providers/personal-info
 * @access  Private
 */
export const updatePersonalInfo = asyncHandler(async (req, res, next) => {
  const { fullName, whatsapp, email, gender } = req.body;

  const provider = req.serviceProvider; // already populated by middleware

  if (fullName !== undefined) {
    provider.fullName = fullName;
  }

  if (!provider.personalInfo) {
    provider.personalInfo = {};
  }

  if (whatsapp !== undefined) {
    provider.personalInfo.whatsapp = whatsapp;
  }
  if (email !== undefined) {
    provider.personalInfo.email = email;
  }
  if (gender !== undefined) {
    provider.personalInfo.gender = gender;
  }

  await provider.save(); // this will trigger validations

  await provider.populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name icon",
    },
  ]);

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Personal information updated successfully",
    data: provider,
  });
});

/**
 * @desc    Update business info (with optional profile image upload)
 * @route   PUT /api/service-providers/business-info
 * @access  Private
 */
export const updateBusinessInfo = asyncHandler(async (req, res, next) => {
  const provider = req.serviceProvider;

  if (!provider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  // Parse JSON fields if they were sent as strings
  let workingDays, workingHours, coordinates, serviceArea;

  try {
    workingDays = req.body.workingDays
      ? JSON.parse(req.body.workingDays)
      : undefined;
    workingHours = req.body.workingHours
      ? JSON.parse(req.body.workingHours)
      : undefined;
    coordinates = req.body.coordinates
      ? JSON.parse(req.body.coordinates)
      : undefined;
    serviceArea = req.body.serviceArea
      ? JSON.parse(req.body.serviceArea)
      : undefined;
  } catch (error) {
    return next(new ErrorHandler(400, "Invalid JSON data in request"));
  }

  // Handle file upload
  if (req.file) {
    try {
      const localPath = req.file.path;
      const imageUrl = await uploadToCloudinary(
        localPath,
        "servmaster/business"
      );

      provider.profileImage = imageUrl;
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return next(new ErrorHandler(500, "Failed to upload profile image"));
    }
  } else if (req.body.profileImage && !req.file) {
    // Handle case where image URL was sent directly
    provider.businessInfo = provider.businessInfo || {};
    provider.profileImage = req.body.profileImage;
  }

  // Update other fields
  if (req.body.type !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.type = req.body.type;
  }

  if (req.body.name !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.name = req.body.name;
  }

  if (req.body.description !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.description = req.body.description;
  }

  if (req.body.hasPhysicalShop !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.hasPhysicalShop = req.body.hasPhysicalShop;
  }

  if (req.body.address !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.address = req.body.address;
  }

  if (req.body.city !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.city = req.body.city;
  }

  if (workingDays !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.workingDays = workingDays;
  }

  if (workingHours !== undefined) {
    provider.businessInfo = provider.businessInfo || {};
    provider.businessInfo.workingHours = workingHours;
  }

  // Update geo location
  if (coordinates?.latitude && coordinates?.longitude) {
    provider.location = {
      type: "Point",
      coordinates: [coordinates.longitude, coordinates.latitude],
    };
  }

  // Update service area
  if (serviceArea) {
    provider.serviceArea = {
      ...(provider.serviceArea || {}),
      type: serviceArea.type || "radius",
      radiusInMeters: serviceArea.radiusInMeters || 0,
      cities: serviceArea.cities || [],
      states: serviceArea.states || [],
      country: serviceArea.country || "",
    };
  }

  try {
    await provider.save();

    await provider.populate([
      { path: "selectedServices.category", select: "name icon" },
      { path: "selectedServices.services.service", select: "name icon" },
    ]);

    provider.password = undefined;

    res.status(200).json({
      success: true,
      message: "Business information updated successfully!",
      data: provider,
    });
  } catch (saveError) {
    console.error("Save error:", saveError);
    return next(new ErrorHandler(500, "Failed to save provider data"));
  }
});

/**
 * @desc    Update password
 * @route   PUT /api/service-providers/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return next(
      new ErrorHandler(400, "Both old and new passwords are required")
    );
  }

  const provider = req.serviceProvider; // Already populated by middleware

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, provider.password);
  if (!isMatch) {
    return next(new ErrorHandler(400, "Old password is incorrect"));
  }

  // If new password is same as old one
  const isSamePassword = await bcrypt.compare(newPassword, provider.password);
  if (isSamePassword) {
    return next(
      new ErrorHandler(400, "New password must be different from old password")
    );
  }

  // Hash and save new password
  provider.password = await bcrypt.hash(newPassword, 10);
  await provider.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

/**
 * @desc    Update professional verification
 * @route   PUT /api/service-providers/phone-verification
 * @access  Private
 */
export const updatePhoneVerification = asyncHandler(async (req, res, next) => {
  const provider = req.serviceProvider;

  provider.verification.phone = {
    ...provider.verification.phone,
    ...req.body,
  };

  await provider.save();
  await provider.populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name icon",
    },
  ]);

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Phone verification updated successfully",
    data: provider,
  });
});

/**
 * @desc    Update professional verification
 * @route   PUT /api/service-providers/verification/professional-verification
 * @access  Private
 */
export const updateProfessionalVerification = asyncHandler(
  async (req, res, next) => {
    const provider = req.serviceProvider;

    // Validate required fields
    if (
      req.body.experienceYears === undefined ||
      req.body.experienceYears === null
    ) {
      return next(new ErrorHandler(400, "Experience years is required"));
    }

    if (!req.body.education) {
      return next(new ErrorHandler(400, "Education information is required"));
    }

    // Validate experienceYears is a non-negative number
    if (isNaN(req.body.experienceYears) || req.body.experienceYears < 0) {
      return next(
        new ErrorHandler(400, "Experience must be a non-negative number")
      );
    }

    // Validate education length
    if (req.body.education.length > 200) {
      return next(
        new ErrorHandler(
          400,
          "Education information cannot exceed 200 characters"
        )
      );
    }

    // Validate certification if provided
    if (req.body.certification) {
      if (
        !req.body.certification.name ||
        !req.body.certification.issuingOrganization
      ) {
        return next(
          new ErrorHandler(
            400,
            "Certification name and issuing organization are required"
          )
        );
      }

      if (
        req.body.certification.yearObtained &&
        isNaN(req.body.certification.yearObtained)
      ) {
        return next(
          new ErrorHandler(400, "Certification year must be a valid number")
        );
      }
    }

    try {
      // Update professional verification info - let pre-save handle status
      provider.verification.professional.experienceYears = parseInt(
        req.body.experienceYears,
        10
      );
      provider.verification.professional.education = req.body.education.trim();

      if (req.body.certification) {
        provider.verification.professional.certification = {
          name: req.body.certification.name.trim(),
          issuingOrganization:
            req.body.certification.issuingOrganization.trim(),
          ...(req.body.certification.yearObtained && {
            yearObtained: parseInt(req.body.certification.yearObtained, 10),
          }),
        };
      }

      await provider.save();

      await provider.populate([
        { path: "selectedServices.category", select: "name icon" },
        { path: "selectedServices.services.service", select: "name icon" },
      ]);

      res.status(200).json({
        success: true,
        message: "Professional information updated successfully",
        data: provider,
      });
    } catch (error) {
      console.error("Professional info update error:", error);

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return next(
          new ErrorHandler(400, `Validation failed: ${errors.join(", ")}`)
        );
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return next(new ErrorHandler(400, "Duplicate field value entered"));
      }

      // Handle other errors
      return next(new ErrorHandler(500, "Internal server error"));
    }
  }
);

/**
 * @desc    Upload Selfie and CNIC front/back images + CNIC Number
 * @route   PUT /api/service-providers/verification/identity
 * @access  Private
 */
export const uploadIdentityDocuments = asyncHandler(async (req, res, next) => {
  const files = req.files || {};
  const selfie = files.selfie;
  const cnicFront = files.cnicFront;
  const cnicBack = files.cnicBack;
  const { cnicNumber } = req.body;

  const provider = req.serviceProvider;

  try {
    // 🔐 Validate CNIC format before saving
    if (cnicNumber) {
      const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
      if (!cnicRegex.test(cnicNumber)) {
        return next(
          new ErrorHandler(400, "Invalid CNIC format. Use XXXXX-XXXXXXX-X")
        );
      }
      provider.verification.identity.cnicNumber = cnicNumber;
    }

    // 📤 Helper for upload + delete
    const uploadAndAssign = async (file, fieldPath, folder) => {
      const localPath = file[0].path;
      const url = await uploadToCloudinary(localPath, folder);
      provider.verification.identity[fieldPath] = url;
    };

    // 🌐 Upload if exists
    if (selfie) await uploadAndAssign(selfie, "selfie", "servmaster/selfies");
    if (cnicFront)
      await uploadAndAssign(cnicFront, "cnicFront", "servmaster/cnic/front");
    if (cnicBack)
      await uploadAndAssign(cnicBack, "cnicBack", "servmaster/cnic/back");

    // Let pre-save middleware handle status update
    await provider.save();

    await provider.populate([
      { path: "selectedServices.category", select: "name icon" },
      { path: "selectedServices.services.service", select: "name icon" },
    ]);

    // Remove sensitive info
    provider.password = undefined;

    res.status(200).json({
      success: true,
      message: "Identity documents uploaded successfully",
      data: provider,
    });
  } catch (error) {
    console.error("Identity upload error:", error);

    // Handle Cloudinary upload errors
    if (error.message.includes("Cloudinary upload")) {
      return next(
        new ErrorHandler(500, "Failed to upload files to cloud storage")
      );
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorHandler(400, `Validation failed: ${errors.join(", ")}`)
      );
    }

    return next(new ErrorHandler(500, "Internal server error"));
  }
});

/**
 * @desc    Upload work portfolio images
 * @route   PUT /api/service-providers/portfolio
 * @access  Private
 */
export const uploadWorkImages = asyncHandler(async (req, res, next) => {
  const provider = req.serviceProvider;
  const imagePaths = req.files?.map((file) => file.path) || [];

  if (imagePaths.length === 0) {
    return next(new ErrorHandler(400, "No images provided"));
  }

  if (!provider.portfolio) provider.portfolio = { images: [] };

  provider.portfolio.images.push(...imagePaths);

  await provider.save();

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Work images uploaded successfully",
    data: provider.portfolio.images,
  });
});

/**
 * @desc    Add services and sub-services
 * @route   POST /api/service-providers/add-services
 * @access  Private
 */
export const addServices = asyncHandler(async (req, res) => {
  const { category, services } = req.body;
  const provider = req.serviceProvider; // already populated by middleware

  if (!category || !Array.isArray(services)) {
    return next(
      new ErrorHandler(
        400,
        "Invalid input: category and services are required."
      )
    );
  }

  // Find existing category block
  const existingCategoryBlock = provider.selectedServices.find(
    (entry) => entry.category.toString() === category
  );

  if (existingCategoryBlock) {
    // Collect already added service IDs
    const existingServiceIds = existingCategoryBlock.services.map((s) =>
      s.service.toString()
    );

    // Filter out duplicates and push new ones
    services.forEach((srv) => {
      if (!existingServiceIds.includes(srv.serviceId)) {
        existingCategoryBlock.services.push({
          service: srv.serviceId,
          pricing: {
            type: srv.pricingType,
            amount:
              srv.pricingType === "negotiable"
                ? undefined
                : Number(srv.price || 0),
            currency: "PKR",
            notes: srv.notes || "",
          },
        });
      }
    });
  } else {
    // New category block
    provider.selectedServices.push({
      category,
      services: services.map((srv) => ({
        service: srv.serviceId,
        pricing: {
          type: srv.pricingType,
          amount:
            srv.pricingType === "negotiable"
              ? undefined
              : Number(srv.price || 0),
          currency: "PKR",
          notes: srv.notes || "",
        },
      })),
      addedAt: new Date(),
    });
  }

  await provider.save();

  const populated = await provider.populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name icon",
    },
  ]);

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Services updated successfully.",
    data: populated,
  });
});

/**
 * @desc    Get service details with reviews
 * @route   GET /api/services/:serviceId/details
 * @access  Private (Service Provider)
 */
export const getServiceDetails = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;
  const provider = req.serviceProvider;

  // Verify the service belongs to this provider
  const service = await Service.findById(serviceId).populate(
    "parent_service",
    "name icon"
  );

  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  // Get reviews for this service
  const reviews = await Review.find({
    service: serviceId,
    service_provider: provider._id,
  })
    .populate("customer", "fullName profileImage")
    .sort({ createdAt: -1 });

  // Calculate average rating
  let averageRating = 0;
  if (reviews.length > 0) {
    const totalRatings = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    averageRating = totalRatings / reviews.length;
  }

  // Get pricing info from provider's selectedServices
  let pricingInfo = null;
  let available = null;
  const providerService = provider.selectedServices
    .flatMap((cat) => cat.services)
    .find((s) => s.service.toString() === serviceId);

  if (providerService) {
    pricingInfo = providerService.pricing;
    available = providerService.available;
  }

  res.status(200).json({
    success: true,
    data: {
      _id: service._id,
      name: service.name,
      description: service.description,
      category: service.parent_service?.name || null,
      icon: service.parent_service.icon,
      pricing: pricingInfo,
      rating: {
        average: averageRating,
        count: reviews.length,
      },
      available,
      reviews,
    },
  });
});

/**
 * @desc    Provider: Delete a service
 * @route   DELETE /api/service-providers/services/:serviceId
 * @access  Service Provider
 */
export const deleteService = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;

  const provider = req.serviceProvider;

  let serviceFound = false;

  // Loop through each category
  provider.selectedServices = provider.selectedServices.map((catEntry) => {
    // Filter out the service from this category's services array
    const filteredServices = catEntry.services.filter(
      (s) => s.service.toString() !== serviceId
    );

    if (filteredServices.length !== catEntry.services.length) {
      serviceFound = true;
    }

    return {
      ...catEntry.toObject(),
      services: filteredServices,
    };
  });

  // Remove category entries that have no services left
  provider.selectedServices = provider.selectedServices.filter(
    (catEntry) => catEntry.services.length > 0
  );

  if (!serviceFound) {
    return next(new ErrorHandler(404, "Service not found in your profile."));
  }

  await provider.save();

  await provider.populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name icon",
    },
  ]);

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Service removed successfully",
    data: provider,
  });
});

/**
 * @desc    Provider: Update a service
 * @route   PUT /api/service-providers/services/:serviceId
 * @access  Service Provider
 */
export const updateService = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;
  const { categoryId, pricing, available } = req.body;

  if (
    pricing &&
    pricing.type !== "negotiable" &&
    (!pricing.amount || pricing.amount <= 0)
  ) {
    return next(
      new ErrorHandler(400, "Amount is required for non-negotiable pricing")
    );
  }

  const provider = req.serviceProvider;

  // Find the category block
  const categoryBlock = provider.selectedServices.find(
    (entry) => entry.category.toString() === categoryId
  );

  if (!categoryBlock) {
    return next(new ErrorHandler(404, "Category not found"));
  }

  // Find the service in this category
  const serviceEntry = categoryBlock.services.find(
    (s) => s.service.toString() === serviceId
  );

  if (!serviceEntry) {
    return next(new ErrorHandler(404, "Service not found in this category"));
  }

  // Update the service details
  serviceEntry.pricing.type = pricing.type || "negotiable";
  serviceEntry.pricing.amount =
    pricing.type === "negotiable" ? undefined : Number(pricing.amount || 0);
  serviceEntry.pricing.notes = pricing.notes || "";
  serviceEntry.available = available;

  await provider.save();

  await provider.populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name icon",
    },
  ]);

  provider.password = undefined;

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: provider,
  });
});

/**
 * @desc    Admin: Get all service providers
 * @route   GET /api/service-providers/all
 * @access  Admin
 */
export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const providers = await ServiceProvider.find()
    .select("-password")
    .populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name icon",
      },
    ]);

  res.status(200).json({
    success: true,
    message: "All Service Providers fetched successfully",
    data: providers,
  });
});

/**
 * @descGet single service provider by ID
 * @route GET /api/service-providers/:id
 * @accessPrivate (Admin or Self)
 */
export const getServiceProviderById = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id)
    .select("-password")
    .populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name icon",
      },
    ]);

  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  res.status(200).json({
    success: true,
    message: "Service provider fetched successfully",
    data: serviceProvider,
  });
});

/**
 * @descApprove service provider (Admin Only)
 * @route PUT /api/service-providers/:id/approve
 * @accessPrivate (Admin only)
 */
export const approveServiceProvider = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id)
    .select("-password")
    .populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name icon",
      },
    ]);

  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  serviceProvider.is_verified = true;
  serviceProvider.is_approved = true;

  await serviceProvider.save();

  res.status(200).json({
    success: true,
    message: "Service provider approved successfully",
    data: serviceProvider,
  });
});

/**
 * @descDelete service provider
 * @route DELETE /api/service-providers/:id
 * @accessPrivate (Admin only)
 */
export const deleteServiceProvider = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id).select(
    "-password"
  );

  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  await serviceProvider.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service provider deleted successfully",
  });
});

/**
 * @descForgot Password (Send OTP)
 * @route POST /api/service-providers/forgot-password
 * @accessPublic
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const serviceProvider = await ServiceProvider.findOne({ email }).select(
    "-password"
  );

  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStorage[email] = otp;

  // Send OTP via email
  await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

  res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

/**
 * @descReset Password
 * @route POST /api/service-providers/reset-password
 * @accessPublic
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!otpStorage[email] || otpStorage[email] !== otp) {
    return next(new ErrorHandler(400, "Invalid or expired OTP"));
  }

  const serviceProvider = await ServiceProvider.findOne({ email });
  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  serviceProvider.password = await bcrypt.hash(newPassword, salt);
  await serviceProvider.save();

  // Clear OTP
  delete otpStorage[email];

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

/**
 * @desc    Get provider dashboard stats
 * @route   GET /api/provider/dashboard
 * @access  Private (Provider)
 */
export const getProviderDashboardStats = asyncHandler(
  async (req, res, next) => {
    const provider = req.serviceProvider;
    const providerId = provider._id;

    // Get counts in parallel
    const [
      totalServices,
      todayRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
      todayEarnings,
      reviews,
      recentBookings,
    ] = await Promise.all([
      // Total services (from Provider)
      provider.selectedServices.reduce(
        (total, category) => total + category.services.length,
        0
      ),

      // Today's service requests
      ServiceRequest.countDocuments({
        service_provider: providerId,
        createdAt: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lte: new Date().setHours(23, 59, 59, 999),
        },
      }),

      // Pending requests
      ServiceRequest.countDocuments({
        service_provider: providerId,
        status: "pending",
      }),

      // Accepted requests
      ServiceRequest.countDocuments({
        service_provider: providerId,
        status: "accepted",
      }),

      // Completed requests
      ServiceRequest.countDocuments({
        service_provider: providerId,
        status: "completed",
      }),

      // Today's earnings
      ServiceRequest.aggregate([
        {
          $match: {
            service_provider: providerId,
            status: "completed",
            createdAt: {
              $gte: new Date().setHours(0, 0, 0, 0),
              $lte: new Date().setHours(23, 59, 59, 999),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.amount" },
          },
        },
      ]),

      // Rating data
      Review.aggregate([
        {
          $match: { service_provider_id: providerId },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),

      // Recent activity (last 3 requests)
      ServiceRequest.find({ service_provider: providerId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("customer", "fullName")
        .populate("service", "name"),
    ]);

    // Format recent activity
    const recentActivity = recentBookings.map((request) => ({
      id: request._id,
      type: "service_request",
      status: request.status,
      title: `Request #${request._id.toString().slice(-6)}`,
      description: `${request.service.name} for ${request.customer.fullName}`,
      date: request.createdAt,
      icon:
        request.status === "completed"
          ? "check-circle"
          : request.status === "accepted"
          ? "calendar"
          : "alert-circle",
      color:
        request.status === "completed"
          ? "success"
          : request.status === "accepted"
          ? "info"
          : "warning",
    }));

    // Calculate performance metrics
    const totalCompleted = await ServiceRequest.countDocuments({
      service_provider: providerId,
      status: "completed",
    });
    const totalAccepted = await ServiceRequest.countDocuments({
      service_provider: providerId,
      status: "accepted",
    });

    const completionRate =
      totalAccepted > 0
        ? Math.round((totalCompleted / totalAccepted) * 100)
        : 0;

    // Calculate average response time (in hours)
    const responseTimes = await ServiceRequest.aggregate([
      {
        $match: {
          service_provider: providerId,
          status: { $in: ["accepted", "completed"] },
          createdAt: { $exists: true },
        },
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ["$updated_at", "$createdAt"] },
              3600000, // Convert ms to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    // Response data
    res.status(200).json({
      success: true,
      data: {
        stats: {
          services: totalServices,
          requests: todayRequests,
          earnings: todayEarnings[0]?.total || 0,
          rating: reviews[0]?.averageRating?.toFixed(1) || 0,
          pendingRequests,
          acceptedRequests,
          completedRequests,
          totalReviews: reviews[0]?.totalReviews || 0,
        },
        performance: {
          completionRate,
          avgResponseTime: responseTimes[0]?.avgResponseTime?.toFixed(1) || 0,
          satisfaction: reviews[0]?.averageRating?.toFixed(1) || 0,
        },
        recentActivity,
      },
    });
  }
);

/**
 * @desc    Get booked time slots for a provider
 * @route   GET /api/service-providers/:providerId/booked-time-slots
 * @access  Public or Authenticated
 */
export const getBookedTimeSlots = asyncHandler(async (req, res, next) => {
  const { id: providerId } = req.params;

  if (!providerId) {
    return next(new ErrorHandler(400, "Provider ID is required"));
  }

  const acceptedBookings = await ServiceRequest.find({
    service_provider: providerId,
    status: { $in: ["pending", "accepted"] }, // Future bookings
    scheduled_time: { $gte: new Date() }, // Only future or today's
  });

  const bookedSlots = {};

  acceptedBookings.forEach((booking) => {
    if (!booking.scheduled_time) return;

    const dateObj = new Date(booking.scheduled_time);

    const dateKey = dateObj.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    const timeKey = dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format like "14:00"
    });

    if (!bookedSlots[dateKey]) {
      bookedSlots[dateKey] = [];
    }

    bookedSlots[dateKey].push(timeKey);
  });

  return res.status(200).json({
    success: true,
    data: bookedSlots,
  });
});
