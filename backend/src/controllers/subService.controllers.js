import SubService from "../models/subService.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Create a new sub-service
// @route   POST /api/sub-services
// @access  Private (Admin only)
export const createSubService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;

  if (!name || !parent_service) {
    return next(
      new ErrorHandler(
        "Sub-service name and parent service ID are required",
        400
      )
    );
  }

  const parentExists = await ServiceCategory.findById(parent_service);
  if (!parentExists) {
    return next(new ErrorHandler("Parent service category not found", 404));
  }

  const subService = await SubService.create({
    name,
    description,
    parent_service,
  });

  res.status(201).json({
    success: true,
    message: "Sub-service created successfully",
    subService,
  });
});

// @desc    Get all sub-services
// @route   GET /api/sub-services
// @access  Public
export const getAllSubServices = asyncHandler(async (req, res, next) => {
  const subServices = await SubService.find().populate(
    "parent_service",
    "name"
  );
  res.status(200).json({
    success: true,
    subServices,
  });
});

// @desc    Get sub-services by parent service category
// @route   GET /api/sub-services/parent/:parentId
// @access  Public
export const getSubServicesByParent = asyncHandler(async (req, res, next) => {
  const { parentId } = req.params;

  const parentExists = await ServiceCategory.findById(parentId);
  if (!parentExists) {
    return next(new ErrorHandler("Parent service category not found", 404));
  }

  const subServices = await SubService.find({ parent_service: parentId });

  res.status(200).json({
    success: true,
    subServices,
  });
});

// @desc   Get a single sub-service by ID
// @route  GET /api/sub-services/:id
// @access Public
export const getSubServiceById = asyncHandler(async (req, res, next) => {
  const subService = await SubService.findById(req.params.id).populate(
    "parent_service",
    "name"
  );
  if (!subService) {
    return next(new ErrorHandler("Sub-service not found", 404));
  }

  res.status(200).json({
    success: true,
    subService,
  });
});

// @desc    Update a sub-service
// @route   PUT /api/sub-services/:id
// @access  Private (Admin only)
export const updateSubService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;
  let subService = await SubService.findById(req.params.id);

  if (!subService) {
    return next(new ErrorHandler("Sub-service not found", 404));
  }

  if (parent_service) {
    const parentExists = await ServiceCategory.findById(parent_service);
    if (!parentExists) {
      return next(new ErrorHandler("Parent service category not found", 404));
    }
  }

  subService.name = name || subService.name;
  subService.description = description || subService.description;
  subService.parent_service = parent_service || subService.parent_service;

  await subService.save();

  res.status(200).json({
    success: true,
    message: "Sub-service updated successfully",
    subService,
  });
});

// @desc   Delete a sub-service
// @route  DELETE /api/sub-services/:id
// @access Private (Admin only)
export const deleteSubService = asyncHandler(async (req, res, next) => {
  const subService = await SubService.findById(req.params.id);
  if (!subService) {
    return next(new ErrorHandler("Sub-service not found", 404));
  }

  await subService.deleteOne();

  res.status(200).json({
    success: true,
    message: "Sub-service deleted successfully",
  });
});
