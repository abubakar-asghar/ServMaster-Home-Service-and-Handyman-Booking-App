import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import Customer from "../models/customer.model.js";
import {
  generateToken,
  generateLimitedToken,
} from "../services/generateJWTToken.js";
import { sendVerificationCode, verifyCode } from "../services/twilioService.js";

/**
 * @desc    Login user (customer or service provider)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(
      new ErrorHandler(400, "Please provide both phone and password")
    );
  }

  // Try to find in ServiceProvider first
  let user = await ServiceProvider.findOne({ phone }).populate([
    {
      path: "selectedServices.category",
      select: "name icon",
    },
    {
      path: "selectedServices.services.service",
      select: "name",
    },
  ]);

  // If not found, check Customer
  if (!user) {
    user = await Customer.findOne({ phone });
  }

  if (!user) {
    return next(new ErrorHandler(401, "User not found with this phone number"));
  }

  // Check if phone is verified
  if (!user.isPhoneVerified) {
    // Send verification code before returning error
    const verificationResult = await sendVerificationCode(phone);

    if (!verificationResult.success) {
      return next(new ErrorHandler(500, "Failed to send verification code"));
    }

    return next(
      new ErrorHandler(
        403,
        "Phone number not verified. Verification code sent."
      )
    );
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler(401, "Invalid password"));
  }

  const token = generateToken(user._id, user.role);
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: user,
    token,
  });
});

/**
 * @desc    Register a new service provider with phone verification
 * @route   POST /api/auth/register/service-provider
 * @access  Public
 */
export const registerServiceProvider = asyncHandler(async (req, res, next) => {
  const { fullName, phone, gender, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  // Check if user exists in either collection
  let existingUser = await ServiceProvider.findOne({ phone });
  if (!existingUser) {
    existingUser = await Customer.findOne({ phone });
  }

  if (existingUser) {
    return next(
      new ErrorHandler(400, "User already exists with this phone number")
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const provider = await ServiceProvider.create({
    fullName,
    phone,
    password: hashedPassword,
    gender,
    isPhoneVerified: false, // Explicitly set to false
  });

  // Send verification code
  const verificationResult = await sendVerificationCode(phone);

  if (!verificationResult.success) {
    await ServiceProvider.deleteOne({ _id: provider._id });
    return next(new ErrorHandler(500, "Failed to send verification code"));
  }

  provider.password = undefined;

  res.status(201).json({
    success: true,
    message: "Provider registered successfully. Verification code sent.",
  });
});

/**
 * @desc    Register a new customer with phone verification
 * @route   POST /api/auth/register/customer
 * @access  Public
 */
export const registerCustomer = asyncHandler(async (req, res, next) => {
  const { fullName, phone, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  // Check if user exists in either collection
  let existingUser = await Customer.findOne({ phone });
  if (!existingUser) {
    existingUser = await ServiceProvider.findOne({ phone });
  }

  if (existingUser) {
    return next(
      new ErrorHandler(400, "User already exists with this phone number")
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = await Customer.create({
    fullName,
    phone,
    password: hashedPassword,
    isPhoneVerified: false,
  });

  // Send verification code
  const verificationResult = await sendVerificationCode(phone);

  if (!verificationResult.success) {
    await Customer.deleteOne({ _id: customer._id });
    return next(new ErrorHandler(500, "Failed to send verification code"));
  }

  res.status(201).json({
    success: true,
    message: "Customer registered successfully. Verification code sent.",
  });
});

/**
 * @desc    Verify phone number for both customers and service providers
 * @route   POST /api/auth/verify
 * @access  Private (requires temporary token)
 */
export const verifyUserPhone = asyncHandler(async (req, res, next) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return next(
      new ErrorHandler(400, "Phone and verification code are required")
    );
  }

  // Verify the code
  const verificationResult = await verifyCode(phone, code);

  if (!verificationResult.success) {
    return next(new ErrorHandler(400, "Invalid verification code"));
  }

  // Find user by phone (check both collections)
  let user =
    (await ServiceProvider.findOne({ phone })) ||
    (await Customer.findOne({ phone }));

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  // Update user as verified
  const model = user.role === "Customer" ? Customer : ServiceProvider;
  const updatedUser = await model.findByIdAndUpdate(
    user._id,
    { isPhoneVerified: true },
    { new: true }
  );

  if (updatedUser.role === "ServiceProvider") {
    updatedUser.populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name",
      },
    ]);
  }

  // For public verification, don't return a token
  res.status(200).json({
    success: true,
    message: "Phone number verified successfully",
    data: updatedUser,
  });
});

/**
 * @desc    Resend verification code for both customers and service providers
 * @route   POST /api/auth/resend-verification
 * @access  Private (requires temporary token)
 */
export const resendVerificationCode = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new ErrorHandler(400, "Phone number is required"));
  }

  // Check if user exists
  const user =
    (await ServiceProvider.findOne({ phone })) ||
    (await Customer.findOne({ phone }));

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  if (user.isPhoneVerified) {
    return next(new ErrorHandler(400, "Phone number already verified"));
  }

  // Send new verification code
  const verificationResult = await sendVerificationCode(phone);

  if (!verificationResult.success) {
    return next(new ErrorHandler(500, "Failed to send verification code"));
  }

  res.status(200).json({
    success: true,
    message: "New verification code sent",
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////
export const verifyAuth = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler(401, "User not authenticated"));
  }

  // Populate necessary fields based on user role
  if (user.role === "ServiceProvider") {
    await user.populate([
      {
        path: "selectedServices.category",
        select: "name icon",
      },
      {
        path: "selectedServices.services.service",
        select: "name icon",
      },
    ]);
  }

  res.status(200).json({
    success: true,
    data: user,
    valid: true,
  });
});

export const saveExpoPushToken = asyncHandler(async (req, res, next) => {
  const { userId, role, expoPushToken } = req.body;

  if (!userId || !role || !expoPushToken) {
    return next(new ErrorHandler(400, "Missing required fields"));
  }

  let user;
  if (role === "ServiceProvider") {
    user = await ServiceProvider.findById(userId);
  } else if (role === "Customer") {
    user = await Customer.findById(userId);
  }

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  user.expoPushToken = expoPushToken;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Expo Push Token saved successfully",
  });
});
