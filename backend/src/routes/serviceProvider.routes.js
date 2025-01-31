import { Router } from "express";
import {
  registerServiceProvider,
  getAllServiceProviders,
  getServiceProviderById,
  updateServiceProvider,
  approveServiceProvider,
  deleteServiceProvider,
} from "../controllers/serviceProvider.controllers.js";
import {
  isAuthenticatedAdmin,
  isAuthenticatedServiceProvider,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Register a new service provider
router.post("/register", registerServiceProvider);

// Get all service providers (Admin only)
router.get("/", isAuthenticatedAdmin, getAllServiceProviders);

// Get a single service provider by ID (Admin or Self)
router.get("/:id", isAuthenticatedServiceProvider, getServiceProviderById);

// Update service provider details (Only provider)
router.put("/:id", isAuthenticatedServiceProvider, updateServiceProvider);

// Approve service provider (Admin only)
router.put("/:id/approve", isAuthenticatedAdmin, approveServiceProvider);

// Delete service provider (Admin only)
router.delete("/:id", isAuthenticatedAdmin, deleteServiceProvider);

export default router;
