import jwt from "jsonwebtoken";
import asyncHandler from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import Admin from "../models/admin.model.js";

export const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return next(new ErrorHandler(401, "Access Denied! No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is a temporary token
    if (decoded.isTemporary && req.path !== "/verify") {
      return next(new ErrorHandler(403, "Complete verification first"));
    }

    if (decoded.role === "ServiceProvider") {
      req.user = await ServiceProvider.findById(decoded.id);
    } else if (decoded.role === "Customer") {
      req.user = await Customer.findById(decoded.id);
    }

    if (!req.user) {
      return next(new ErrorHandler(404, "Customer not found!"));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or Expired Token!"));
  }
});

// Verify JWT Token and Attach User to Request (for Customers)
export const isAuthenticatedCustomer = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return next(new ErrorHandler(401, "Access Denied! No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

    // Check if this is a temporary token
    if (decoded.isTemporary && req.path !== "/verify") {
      return next(new ErrorHandler(403, "Complete verification first"));
    }

    req.customer = await Customer.findById(decoded.id); // Attach customer to request

    if (!req.customer) {
      return next(new ErrorHandler(404, "Customer not found!"));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or Expired Token!"));
  }
});

// Verify JWT Token and Attach User to Request (for Service Providers)
export const isAuthenticatedServiceProvider = asyncHandler(
  async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ErrorHandler(401, "Access Denied! No token provided."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if this is a temporary token
      if (decoded.isTemporary && req.path !== "/verify") {
        return next(new ErrorHandler(403, "Complete verification first"));
      }

      const provider = await ServiceProvider.findById(decoded.id);

      if (!provider) {
        return next(new ErrorHandler(404, "Service provider not found!"));
      }

      req.serviceProvider = provider;
      next();
    } catch (error) {
      return next(new ErrorHandler(401, "Invalid or Expired Token!"));
    }
  }
);

// Middleware to Check if User is Admin
export const isAuthenticatedAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler(401, "Access Denied! No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id);

    if (!req.admin) {
      return next(new ErrorHandler(404, "Admin not found!"));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or Expired Token!"));
  }
});

// Middleware to Check if Admin is Super Admin
export const isSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "SuperAdmin") {
    return next(new ErrorHandler(403, "Access denied! Super Admins only."));
  }
  next();
};
