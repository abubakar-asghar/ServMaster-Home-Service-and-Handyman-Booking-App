import { Router } from "express";
import {
  adminLogin,
  createAdmin,
  getAllCustomers,
  getAllServiceProviders,
  deleteCustomer,
  deleteServiceProvider,
  getAdminProfile,
} from "../controllers/admin.controllers.js";
import { isAuthenticatedAdmin, isSuperAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Admin Login
router.post("/login", adminLogin);

// Admin Profile
router.get("/profile", isAuthenticatedAdmin, getAdminProfile);

// Create New Admin (Super Admin Only)
router.post("/create", isAuthenticatedAdmin, isSuperAdmin, createAdmin);

// Get Customers and Service Providers
router.get("/customers", isAuthenticatedAdmin, getAllCustomers);
router.get("/service-providers", isAuthenticatedAdmin, getAllServiceProviders);

// Delete Users (Admin Only)
router.delete("/customer/:id", isAuthenticatedAdmin, deleteCustomer);
router.delete("/service-provider/:id", isAuthenticatedAdmin, deleteServiceProvider);

export default router;
