import Admin from "../models/admin.model.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({ success: true, token, admin });
});

// @desc    Create Admin
// @route   POST /api/admin/create
// @access  Private (Admin)
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password || !role) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler("Admin with this email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role,
    permissions,
  });

  res
    .status(201)
    .json({ success: true, message: "Admin created successfully", newAdmin });
});

// @desc    Get All Customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customer.find();
  res.status(200).json({ success: true, customers });
});

// @desc    Get All Service Providers
// @route   GET /api/admin/service-providers
// @access  Private (Admin)
export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const providers = await ServiceProvider.find();
  res.status(200).json({ success: true, providers });
});

// @desc    Delete Customer
// @route   DELETE /api/admin/customer/:id
// @access  Private (Admin)
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  await customer.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Customer deleted successfully" });
});

// @desc    Delete Service Provider
// @route   DELETE /api/admin/service-provider/:id
// @access  Private (Admin)
export const deleteServiceProvider = asyncHandler(async (req, res, next) => {
  const provider = await ServiceProvider.findById(req.params.id);
  if (!provider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  await provider.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Service provider deleted successfully" });
});

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
export const getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  res.status(200).json({ success: true, admin });
});
