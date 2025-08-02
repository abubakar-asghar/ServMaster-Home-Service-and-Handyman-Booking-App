import Service from "../models/service.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * @desc    Create a new service
 * @route   POST /api/services/create
 * @access  Private (Admin only)
 */
export const createService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;

  if (!name || !parent_service) {
    return next(
      new ErrorHandler(400, "Service name and parent service ID are required")
    );
  }

  const parentExists = await ServiceCategory.findById(parent_service);
  if (!parentExists) {
    return next(new ErrorHandler(404, "Parent service category not found"));
  }

  const service = await Service.create({
    name,
    description,
    parent_service,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

/**
 * @desc    Create multiple services under one parent service
 * @route   POST /api/services/bulk-create
 * @access  Private (Admin only)
 */
export const createMultipleServices = asyncHandler(async (req, res, next) => {
  const { services } = req.body;

  // Validate array
  if (!Array.isArray(services) || services.length === 0) {
    return next(
      new ErrorHandler(400, "Services array is required and cannot be empty")
    );
  }

  // Validate individual services
  for (const sub of services) {
    if (!sub.name || !sub.parent_service) {
      return next(
        new ErrorHandler(
          400,
          "Each service must have a name and parent_service ID"
        )
      );
    }
  }

  // Create all services
  const createdServices = await Service.insertMany(services);

  res.status(201).json({
    success: true,
    message: `${createdServices.length} services created successfully`,
    data: createdServices,
  });
});

/**
 * @desc    Get all services
 * @route   GET /api/services/all
 * @access  Public
 */
export const getAllServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find().populate("parent_service", "name");
  res.status(200).json({
    success: true,
    data: services,
  });
});

/**
 * @desc    Get services by parent service category
 * @route   GET /api/services/parent/:parentId
 * @access  Public
 */
export const getServicesByParent = asyncHandler(async (req, res, next) => {
  const { parentId } = req.params;

  const parentExists = await ServiceCategory.findById(parentId);
  if (!parentExists) {
    return next(new ErrorHandler(404, "Parent service category not found"));
  }

  const services = await Service.find({ parent_service: parentId });

  res.status(200).json({
    success: true,
    message: "Services fetched successfully",
    data: services,
  });
});

/**
 * @desc   Get a single service by ID
 * @route  GET /api/services/:id
 * @access Public
 */
export const getServiceById = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate(
    "parent_service",
    "name"
  );
  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  res.status(200).json({
    success: true,
    service,
  });
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Admin only)
 */
export const updateService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  if (parent_service) {
    const parentExists = await ServiceCategory.findById(parent_service);
    if (!parentExists) {
      return next(new ErrorHandler(404, "Parent service category not found"));
    }
  }

  service.name = name || service.name;
  service.description = description || service.description;
  service.parent_service = parent_service || service.parent_service;

  await service.save();

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    service,
  });
});

/**
 * @desc   Delete a service
 * @route  DELETE /api/services/:id
 * @access Private (Admin only)
 */
export const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});

export const updateIconOfServices = asyncHandler(async (req, res, next) => {
  const data = req.body;

  console.log(data);

  if (!Array.isArray(data)) {
    return next(new ErrorHandler(400, "Given data is not formatted correctly"));
  }

  // Prepare all update operations in parallel
  const updatePromises = data.map(async (item) => {
    const services = await Service.find({ parent_service: item.category });

    // Update icon for each service
    const serviceUpdatePromises = services.map(async (service) => {
      service.icon = item.icon;
      return service.save(); // Return the promise
    });

    return Promise.all(serviceUpdatePromises); // Wait for all inner saves
  });

  // Wait for all outer updates
  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: "Icons updated in all services successfully",
  });
});
