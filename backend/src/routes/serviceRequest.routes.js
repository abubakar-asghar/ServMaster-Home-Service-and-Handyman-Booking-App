import { Router } from "express";
import {
  createServiceRequest,
  getCustomerRequests,
  getProviderRequests,
  updateServiceRequestStatus,
  deleteServiceRequest
} from "../controllers/serviceRequest.controllers.js";
import { isAuthenticatedCustomer, isAuthenticatedServiceProvider } from "../middlewares/authMiddleware.js";

const router = Router();

// Customer creates a service request
router.post("/", isAuthenticatedCustomer, createServiceRequest);

// Get all service requests of a customer
router.get("/customer", isAuthenticatedCustomer, getCustomerRequests);

// Get all service requests assigned to a provider
router.get("/provider", isAuthenticatedServiceProvider, getProviderRequests);

// Service provider updates the request status
router.put("/:id", isAuthenticatedServiceProvider, updateServiceRequestStatus);

// Customer deletes a service request
router.delete("/:id", isAuthenticatedCustomer, deleteServiceRequest);

export default router;
