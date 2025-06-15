import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { generateToken } from "../services/generateJWTToken.js";

/**
 * @desc    Register a new customer
 * @route   POST /api/customers/register
 * @access  Public
 */
export const registerCustomer = asyncHandler(async (req, res, next) => {
  const { fullName, phone, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  // Check if customer exists
  let existingUser = await Customer.findOne({ phone });
  if (!existingUser) {
    existingUser = await ServiceProvider.findOne({ phone });
  }

  if (existingUser) {
    return next(
      new ErrorHandler("User already exists with this phone number", 400)
    );
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new customer
  const customer = await Customer.create({
    fullName,
    phone,
    password: hashedPassword,
    profile_image: "https://example.com/default-profile.jpg", // Hardcoded for now
  });

  // Generate token
  const token = generateToken(customer._id, "customer");

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    data: customer,
    token,
    role: "customer",
  });
});

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
    return next(new ErrorHandler("Customer not found", 404));
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
  const { fullName, phone, profile_image } = req.body;

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  customer.fullName = fullName || customer.fullName;
  customer.phone = phone || customer.phone;
  customer.profile_image = profile_image || customer.profile_image;

  await customer.save();

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer,
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
    return next(new ErrorHandler("Customer not found", 404));
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
    return next(new ErrorHandler("Customer not found", 404));
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
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  const customer = await Customer.findOne({ email });
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
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
