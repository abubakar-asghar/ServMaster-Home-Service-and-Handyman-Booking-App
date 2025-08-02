import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import FavoriteProvider from "../models/favoriteProvider.model.js";
import FavoriteService from "../models/favoriteService.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**
 * @desc    Get all customers
 * @route   GET /api/customers/all
 * @access  Private (Admin only)
 */
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customer.find();

  res.status(200).json({
    success: true,
    count: customers.length,
    customers,
  });
});

/**
 * @desc    Get single customer by ID
 * @route   GET /api/customers/:id
 * @access  Private (Admin or Self)
 */
export const getCustomerById = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  res.status(200).json({
    success: true,
    customer,
  });
});

/**
 * @desc    Update customer details
 * @route   PUT /api/customers/:id
 * @access  Private (Only customer)
 */
export const updateCustomer = asyncHandler(async (req, res, next) => {
  const { fullName } = req.body;
  console.log(fullName);
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  if (req.file) {
    console.log(req.file);
    try {
      const localPath = req.file.path;
      const imageUrl = await uploadToCloudinary(
        localPath,
        "servmaster/customers"
      );

      customer.profileImage = imageUrl;
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      return next(new ErrorHandler(500, "Failed to upload profile image"));
    }
  } else if (req.body.profileImage && !req.file) {
    customer.profileImage = req.body.profileImage;
  }

  customer.fullName = fullName || customer.fullName;

  await customer.save();

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private (Admin only)
 */
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  await customer.deleteOne();

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
});

// Temporary storage for OTPs (In production, use a database or Redis)
const otpStorage = {};

// Function to send email
const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: message,
  });
};

/**
 * @desc    Forgot Password (Send OTP)
 * @route   POST /api/customers/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const customer = await Customer.findOne({ email });

  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
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
 * @desc    Reset Password
 * @route   POST /api/customers/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!otpStorage[email] || otpStorage[email] !== otp) {
    return next(new ErrorHandler(400, "Invalid or expired OTP"));
  }

  const customer = await Customer.findOne({ email });
  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  customer.password = await bcrypt.hash(newPassword, salt);
  await customer.save();

  // Clear OTP
  delete otpStorage[email];

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

/**
 * @desc    Get all favorite providers
 * @route   GET /api/customers/favourite-services/
 * @access  Private (Customer)
 */
export const getFavoriteProviders = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;

  const providers = await FavoriteProvider.find({ customer: customerId })
    .populate("provider")
    .sort("-createdAt");

  res.json({ success: true, data: providers });
});

/**
 * @desc    Add favorite provider
 * @route   POST /api/customers/favourite-services/new
 * @access  Private (Customer)
 */
export const addFavoriteProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.body;
  const customerId = req.customer._id;

  try {
    const fav = await FavoriteProvider.create({
      customer: customerId,
      provider: providerId,
    });

    res
      .status(201)
      .json({ success: true, message: "Added in favorites", data: fav });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Already in favorites" });
    }
    res.status(500).json({
      success: false,
      message: "Added in favorites",
      message: error.message,
    });
  }
});

/**
 * @desc    Remove favorite provider
 * @route   DELETE /api/customers/favourite-services/:id
 * @access  Private (Customer)
 */
export const removeFavoriteProvider = asyncHandler(async (req, res) => {
  const { id: providerId } = req.params;
  const customerId = req.customer._id;

  const deletedProvider = await FavoriteProvider.findOneAndDelete({
    customer: customerId,
    provider: providerId,
  });

  console.log(deletedProvider);

  res.json({ success: true, message: "Removed from favorites" });
});

/**
 * @desc    Check if a provider is favorited
 * @route   GET /api/customers/favourite-providers/:id
 * @access  Private (Customer)
 */
export const checkFavoriteProvider = asyncHandler(async (req, res) => {
  const { id: providerId } = req.params;
  const customerId = req.customer._id;
  const isFavorite = await FavoriteProvider.exists({
    customer: customerId,
    provider: providerId,
  });
  res.json({ success: true, isFavorite });
});

/**
 * @desc    Get all favorite services
 * @route   GET /api/customers/favourite-services/
 * @access  Private (Customer)
 */
export const getFavoriteServices = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;

  const services = await FavoriteService.find({ customer: customerId })
    .populate("service")
    .sort("-createdAt");

  res.json({ success: true, data: services });
});

/**
 * @desc    Add favorite service
 * @route   POST /api/customers/favourite-services/new
 * @access  Private (Customer)
 */
export const addFavoriteService = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;
  const customerId = req.customer._id;

  try {
    const fav = await FavoriteService.create({
      customer: customerId,
      service: serviceId,
    });

    res
      .status(201)
      .json({ success: true, message: "Added in favorites", data: fav });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Already in favorites" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Remove favorite service
 * @route   DELETE /api/customers/favourite-services/:id
 * @access  Private (Customer)
 */
export const removeFavoriteService = asyncHandler(async (req, res) => {
  const { id: serviceId } = req.params;
  const customerId = req.customer._id;

  await FavoriteService.findOneAndDelete({
    customer: customerId,
    service: serviceId,
  });

  res.json({ success: true, message: "Removed from favorites" });
});

/**
 * @desc    Check if a service is favorited
 * @route   GET /api/customers/favourite-services/:id
 * @access  Private (Customer)
 */
export const checkFavoriteService = asyncHandler(async (req, res) => {
  const { id: serviceId } = req.params;
  const customerId = req.customer._id;
  const isFavorite = await FavoriteService.exists({
    customer: customerId,
    service: serviceId,
  });
  res.json({ success: true, isFavorite });
});
