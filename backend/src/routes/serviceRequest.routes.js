import { Router } from "express";
import {
  createServiceRequest,
  getCustomerRequests,
  getProviderRequests,
  updateServiceRequestStatus,
  deleteServiceRequest,
  getBookingDetails
} from "../controllers/serviceRequest.controllers.js";
import { isAuthenticatedCustomer, isAuthenticatedServiceProvider, isAuthenticatedUser } from "../middlewares/authMiddleware.js";

const router = Router();

// Customer creates a service request
router.post("/", isAuthenticatedCustomer, createServiceRequest);

// Get all service requests of a customer
router.get("/customer", isAuthenticatedCustomer, getCustomerRequests);

// Get all service requests assigned to a provider
router.get("/provider", isAuthenticatedServiceProvider, getProviderRequests);

// Get service request detail of a customer
router.get("/:id", isAuthenticatedUser, getBookingDetails)

// Service provider updates the request status
router.put("/:id", isAuthenticatedServiceProvider, updateServiceRequestStatus);

// Customer deletes a service request
router.delete("/:id", isAuthenticatedCustomer, deleteServiceRequest);

export default router;
