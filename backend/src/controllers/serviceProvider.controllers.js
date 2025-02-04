import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";


// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new service provider
// @route   POST /api/service-providers/register
// @access  Public
export const registerServiceProvider = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    password,
    service_types,
    sub_services,
    experience,
    certifications,
    cnic_number,
    cnic_images,
    selfie_image,
    previous_work_images,
  } = req.body;

  // Check if provider exists
  const existingProvider = await ServiceProvider.findOne({ email });
  if (existingProvider) {
    return next(new ErrorHandler("Service provider already exists", 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new service provider
  const serviceProvider = await ServiceProvider.create({
    name,
    email,
    phone,
    password: hashedPassword,
    service_types,
    sub_services,
    experience,
    certifications,
    cnic_number,
    cnic_images,
    selfie_image,
    previous_work_images,
    profile_image: "https://example.com/default-profile.jpg", // Hardcoded for now
  });

  // Generate token
  const token = generateToken(serviceProvider._id);

  res.status(201).json({
    success: true,
    message: "Service provider registered successfully",
    token,
    serviceProvider: {
      id: serviceProvider._id,
      name: serviceProvider.name,
      email: serviceProvider.email,
      phone: serviceProvider.phone,
      service_types: serviceProvider.service_types,
      sub_services: serviceProvider.sub_services,
      experience: serviceProvider.experience,
      profile_image: serviceProvider.profile_image,
    },
  });
});

// @desc    Login service provider
// @route   POST /api/service-providers/login
// @access  Public
export const loginServiceProvider = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find service provider
  const serviceProvider = await ServiceProvider.findOne({ email });
  if (!serviceProvider) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check password
  const isMatch = await bcrypt.compare(password, serviceProvider.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Generate token
  const token = generateToken(serviceProvider._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    serviceProvider: {
      id: serviceProvider._id,
      name: serviceProvider.name,
      email: serviceProvider.email,
      phone: serviceProvider.phone,
      service_types: serviceProvider.service_types,
      sub_services: serviceProvider.sub_services,
      experience: serviceProvider.experience,
      profile_image: serviceProvider.profile_image,
    },
  });
});

// @desc    Get all service providers
// @route   GET /api/service-providers
// @access  Private (Admin only)
export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const serviceProviders = await ServiceProvider.find().populate(
    "service_types sub_services"
  );

  res.status(200).json({
    success: true,
    count: serviceProviders.length,
    serviceProviders,
  });
});

// @desc    Get single service provider by ID
// @route   GET /api/service-providers/:id
// @access  Private (Admin or Self)
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

// @desc    Update service provider details
// @route   PUT /api/service-providers/:id
// @access  Private (Only service provider)
export const updateServiceProvider = asyncHandler(async (req, res, next) => {
  const {
    name,
    phone,
    service_types,
    sub_services,
    experience,
    certifications,
    previous_work_images,
    profile_image,
  } = req.body;

  const serviceProvider = await ServiceProvider.findById(req.params.id);
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  serviceProvider.name = name || serviceProvider.name;
  serviceProvider.phone = phone || serviceProvider.phone;
  serviceProvider.service_types =
    service_types || serviceProvider.service_types;
  serviceProvider.sub_services = sub_services || serviceProvider.sub_services;
  serviceProvider.experience = experience || serviceProvider.experience;
  serviceProvider.certifications =
    certifications || serviceProvider.certifications;
  serviceProvider.previous_work_images =
    previous_work_images || serviceProvider.previous_work_images;
  serviceProvider.profile_image =
    profile_image || serviceProvider.profile_image;

  await serviceProvider.save();

  res.status(200).json({
    success: true,
    message: "Service provider updated successfully",
    serviceProvider,
  });
});

// @desc    Approve service provider (Admin Only)
// @route   PUT /api/service-providers/:id/approve
// @access  Private (Admin only)
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

// @desc    Delete service provider
// @route   DELETE /api/service-providers/:id
// @access  Private (Admin only)
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

// @desc    Forgot Password (Send OTP)
// @route   POST /api/service-providers/forgot-password
// @access  Public
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

// @desc    Reset Password
// @route   POST /api/service-providers/reset-password
// @access  Public
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
