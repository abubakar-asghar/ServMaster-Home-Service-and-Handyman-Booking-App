import jwt from "jsonwebtoken";
import asyncHandler from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";

// Verify JWT Token and Attach User to Request (for Customers)
export const isAuthenticatedCustomer = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return next(new ErrorHandler("Access Denied! No token provided.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.customer = await Customer.findById(decoded.id).select("-password"); // Attach customer to request

    if (!req.customer) {
      return next(new ErrorHandler("Customer not found!", 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or Expired Token!", 401));
  }
});

// Verify JWT Token and Attach User to Request (for Service Providers)
export const isAuthenticatedServiceProvider = asyncHandler(
  async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ErrorHandler("Access Denied! No token provided.", 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.serviceProvider = await ServiceProvider.findById(decoded.id).select(
        "-password"
      );

      if (!req.serviceProvider) {
        return next(new ErrorHandler("Service provider not found!", 404));
      }

      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid or Expired Token!", 401));
    }
  }
);

// Middleware to Check if User is Admin
export const isAuthenticatedAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("Access Denied! No token provided.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return next(new ErrorHandler("Admin not found!", 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or Expired Token!", 401));
  }
});

// Middleware to Check if Admin is Super Admin
export const isSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "super_admin") {
    return next(new ErrorHandler("Access denied! Super Admins only.", 403));
  }
  next();
};
