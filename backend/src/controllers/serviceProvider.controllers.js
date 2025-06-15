import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../services/generateJWTToken.js";

/**
 * @desc    Register a new service provider
 * @route   POST /api/service-providers/register
 * @access  Public
 */
export const registerServiceProvider = asyncHandler(async (req, res, next) => {
  const { fullName, phone, gender, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  const existing = await ServiceProvider.findOne({ phone });
  if (existing) {
    return next(new ErrorHandler(400, "Phone number already exists"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const provider = await ServiceProvider.create({
    fullName,
    phone,
    password: hashedPassword,
    gender,
  });

  // Generate token
  const token = generateToken(provider._id, "service-provider");

  res.status(201).json({
    success: true,
    message: "Provider registered successfully",
    data: provider,
    token,
    role: "service-provider",
  });
});

/**
 * @desc    Get logged-in provider profile
 * @route   GET /api/service-providers/profile
 * @access  Private
 */
export const getServiceProviderProfile = asyncHandler(
  async (req, res, next) => {
    const provider = await ServiceProvider.findById(req.serviceProvider._id);
    if (!provider) return next(new ErrorHandler(404, "Provider not found"));
    res.status(200).json({
      success: true,
      message: "Provider profile fetched successfully",
      data: provider,
    });
  }
);

/**
 * @desc    Get service providers by service ID
 * @route   PUT /api/service-providers/:serviceId
 * @access  Public
 */
export const getServiceProvidersByService = asyncHandler(
  async (req, res, next) => {
    const { serviceId } = req.params;
    const providers = await ServiceProvider.find({
      "services.serviceId": serviceId,
    }).populate("services.serviceId services.services");

    if (!providers || providers.length === 0) {
      return next(new ErrorHandler(404, "No providers found for this service"));
    }

    res.status(200).json({
      success: true,
      message: "Providers fetched successfully",
      data: providers,
    });
  }
);

/**
 * @desc    Update personal info
 * @route   PUT /api/service-providers/personal-info
 * @access  Private
 */
export const updatePersonalInfo = asyncHandler(async (req, res, next) => {
  const { fullName, whatsapp, email, gender } = req.body;

  const updatedInfo = {};

  if (fullName !== undefined) {
    updatedInfo.fullName = fullName;
  }

  if (whatsapp !== undefined || email !== undefined || gender !== undefined) {
    updatedInfo.personalInfo = {};

    if (whatsapp !== undefined) {
      updatedInfo.personalInfo.whatsapp = whatsapp;
    }
    if (email !== undefined) {
      updatedInfo.personalInfo.email = email;
    }
    if (gender !== undefined) {
      updatedInfo.personalInfo.gender = gender;
    }
  }

  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { $set: updatedInfo },
    { new: true }
  );

  provider.password = undefined;
  if (!provider) return next(new ErrorHandler(404, "Provider not found"));

  res.status(200).json({
    success: true,
    message: "Personal information updated successfully",
    data: provider,
  });
});

/**
 * @desc    Update business info
 * @route   PUT /api/service-providers/business-info
 * @access  Private
 */
export const updateBusinessInfo = asyncHandler(async (req, res, next) => {
  const {
    profileImage,
    type,
    name,
    description,
    address,
    city,
    hasPhysicalShop,
    workingDays,
    workingHours,
  } = req.body;

  const updateFields = {};

  if (profileImage !== undefined)
    updateFields["businessInfo.profileImage"] = profileImage;
  if (type !== undefined) updateFields["businessInfo.type"] = type;
  if (name !== undefined) updateFields["businessInfo.name"] = name;
  if (description !== undefined)
    updateFields["businessInfo.description"] = description;
  if (address !== undefined) updateFields["businessInfo.address"] = address;
  if (city !== undefined) updateFields["businessInfo.city"] = city;
  if (hasPhysicalShop !== undefined)
    updateFields["businessInfo.hasPhysicalShop"] = hasPhysicalShop;
  if (workingDays !== undefined)
    updateFields["businessInfo.workingDays"] = workingDays;
  if (workingHours !== undefined)
    updateFields["businessInfo.workingHours"] = workingHours;

  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { $set: updateFields },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Business information updated successfully",
    data: provider,
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/service-providers/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const provider = await ServiceProvider.findById(req.serviceProvider._id);
  if (!provider) return next(new ErrorHandler(404, "Provider not found"));

  const isMatch = await bcrypt.compare(oldPassword, provider.password);
  if (!isMatch) return next(new ErrorHandler(400, "Old password is incorrect"));

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  provider.password = hashedPassword;
  await provider.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

/**
 * @desc    Update professional verification
 * @route   PUT /api/service-providers/phone-verification
 * @access  Private
 */
export const updatePhoneVerification = asyncHandler(async (req, res, next) => {
  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { "verification.phone": req.body },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Professional verification done successfully",
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
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.serviceProvider._id,
      { "verification.professional": req.body },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Professional verification done successfully",
      data: provider,
    });
  }
);

/**
 * @desc    Update CNIC/identity info
 * @route   PUT /api/service-providers/identity-verification
 * @access  Private
 */
export const updateIdentityVerification = asyncHandler(
  async (req, res, next) => {
    const { cnicNumber } = req.body;
    const existing = await ServiceProvider.findOne({
      "verification.identity.cnicNumber": cnicNumber,
      _id: { $ne: req.serviceProvider._id },
    });
    if (existing) return next(new ErrorHandler(400, "CNIC already exists"));

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.serviceProvider._id,
      {
        "verification.identity": {
          ...req.body,
          status: "not_verified",
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    res.json(provider);
  }
);

/**
 * @desc    Upload CNIC front/back images
 * @route   PUT /api/service-providers/verification/cnic-images
 * @access  Private
 */
export const uploadCNICImages = asyncHandler(async (req, res, next) => {
  const { cnicFront, cnicBack } = req.files;

  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    {
      "verification.identity.cnicFront": cnicFront?.[0]?.path,
      "verification.identity.cnicBack": cnicBack?.[0]?.path,
    },
    { new: true }
  );
  res.json(provider);
});

/**
 * @desc    Upload selfie image
 * @route   PUT /api/service-providers/verification/selfie
 * @access  Private
 */
export const uploadSelfie = asyncHandler(async (req, res, next) => {
  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { "verification.identity.selfieImage": req.file.path },
    { new: true }
  );
  res.json(provider);
});

/**
 * @desc    Upload work portfolio images
 * @route   PUT /api/service-providers/portfolio
 * @access  Private
 */
export const uploadWorkImages = asyncHandler(async (req, res, next) => {
  const imagePaths = req.files.map((file) => file.path);
  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { $push: { "portfolio.images": { $each: imagePaths } } },
    { new: true }
  );
  res.json(provider);
});

/**
 * @desc    Add services and sub-services
 * @route   PUT /api/service-providers/services
 * @access  Private
 */
export const addServices = asyncHandler(async (req, res, next) => {
  const { services } = req.body;

  const provider = await ServiceProvider.findByIdAndUpdate(
    req.serviceProvider._id,
    { services },
    { new: true }
  );
  res.json(provider);
});

/**
 * @desc    Admin: Get all service providers
 * @route   GET /api/service-providers/all
 * @access  Admin
 */
export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const providers = await ServiceProvider.find().populate([
    { path: "services.category", strictPopulate: false },
    { path: "services.subServices", strictPopulate: false },
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
  const serviceProvider = await ServiceProvider.findById(
    req.params.id
  ).populate("service_types sub_services");

  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  res.status(200).json({
    success: true,
    serviceProvider,
  });
});

/**
 * @descApprove service provider (Admin Only)
 * @route PUT /api/service-providers/:id/approve
 * @accessPrivate (Admin only)
 */
export const approveServiceProvider = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  serviceProvider.is_verified = true;
  serviceProvider.is_approved = true;

  await serviceProvider.save();

  res.status(200).json({
    success: true,
    message: "Service provider approved successfully",
    serviceProvider,
  });
});

/**
 * @descDelete service provider
 * @route DELETE /api/service-providers/:id
 * @accessPrivate (Admin only)
 */
export const deleteServiceProvider = asyncHandler(async (req, res, next) => {
  const serviceProvider = await ServiceProvider.findById(req.params.id);

  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
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
  const serviceProvider = await ServiceProvider.findOne({ email });

  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
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
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  const serviceProvider = await ServiceProvider.findOne({ email });
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
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
