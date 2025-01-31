import ServiceRequest from "../models/serviceRequest.model.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * @desc    Create a new service request
 * @route   POST /api/service-requests
 * @access  Private (Customer Only)
 */
export const createServiceRequest = asyncHandler(async (req, res, next) => {
  const {
    service_provider_id,
    service_category_id,
    sub_service_id,
    scheduled_time,
    customer_notes,
  } = req.body;
  const customer_id = req.customer.id;

  if (!service_provider_id || !service_category_id) {
    return next(
      new ErrorHandler("Service provider and category are required", 400)
    );
  }

  const serviceProvider = await ServiceProvider.findById(service_provider_id);
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  const newRequest = await ServiceRequest.create({
    customer_id,
    service_provider_id,
    service_category_id,
    sub_service_id,
    scheduled_time,
    customer_notes,
  });

  res.status(201).json({
    success: true,
    message: "Service request created successfully",
    request: newRequest,
  });
});

/**
 * @desc    Get all service requests for a customer
 * @route   GET /api/service-requests/customer
 * @access  Private (Customer Only)
 */
export const getCustomerRequests = asyncHandler(async (req, res, next) => {
  const customer_id = req.customer.id;

  const requests = await ServiceRequest.find({ customer_id })
    .populate("service_provider_id", "name email phone")
    .populate("service_category_id", "name")
    .populate("sub_service_id", "name");

  res.status(200).json({ success: true, requests });
});

/**
 * @desc    Get all service requests for a service provider
 * @route   GET /api/service-requests/provider
 * @access  Private (Service Provider Only)
 */
export const getProviderRequests = asyncHandler(async (req, res, next) => {
  const service_provider_id = req.serviceProvider.id;

  const requests = await ServiceRequest.find({ service_provider_id })
    .populate("customer_id", "name email phone")
    .populate("service_category_id", "name")
    .populate("sub_service_id", "name");

  res.status(200).json({ success: true, requests });
});

/**
 * @desc    Update the status of a service request
 * @route   PUT /api/service-requests/:id
 * @access  Private (Service Provider Only)
 */
export const updateServiceRequestStatus = asyncHandler(
  async (req, res, next) => {
    const { status } = req.body;
    const requestId = req.params.id;

    const validStatuses = ["pending", "accepted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status value", 400));
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return next(new ErrorHandler("Service request not found", 404));
    }

    // Only assigned provider can update status
    if (
      serviceRequest.service_provider_id.toString() !== req.serviceProvider.id
    ) {
      return next(new ErrorHandler("Unauthorized to update this request", 403));
    }

    serviceRequest.status = status;
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: "Service request status updated",
      serviceRequest,
    });
  }
);

/**
 * @desc    Delete a service request (Only by customer)
 * @route   DELETE /api/service-requests/:id
 * @access  Private (Customer Only)
 */
export const deleteServiceRequest = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;
  const customer_id = req.customer.id;

  const serviceRequest = await ServiceRequest.findOne({
    _id: requestId,
    customer_id,
  });
  if (!serviceRequest) {
    return next(
      new ErrorHandler("Service request not found or unauthorized", 404)
    );
  }

  await serviceRequest.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Service request deleted successfully" });
});
