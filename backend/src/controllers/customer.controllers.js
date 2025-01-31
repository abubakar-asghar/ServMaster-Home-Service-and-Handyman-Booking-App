import Customer from "../models/customer.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Register a new customer
// @route   POST /api/customers/register
// @access  Public
export const registerCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  // Check if user exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return next(new ErrorHandler("Customer already exists", 400));
  }

  // Create new customer
  const customer = await Customer.create({
    name,
    email,
    phone,
    password,
    profile_image: "https://example.com/default-profile.jpg", // Hardcoded for now
  });

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    customer,
  });
});

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin only)
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customer.find();

  res.status(200).json({
    success: true,
    count: customers.length,
    customers,
  });
});

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Admin or Self)
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

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Private (Only customer)
export const updateCustomer = asyncHandler(async (req, res, next) => {
  const { name, phone, profile_image } = req.body;

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  customer.name = name || customer.name;
  customer.phone = phone || customer.phone;
  customer.profile_image = profile_image || customer.profile_image;

  await customer.save();

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer,
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
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
