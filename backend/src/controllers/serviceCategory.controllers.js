import ServiceCategory from "../models/serviceCategory.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Create a new service category
// @route   POST /api/service-categories
// @access  Private (Admin only)
export const createServiceCategory = asyncHandler(async (req, res, next) => {
  const { name, description, icon } = req.body;

  if (!name) {
    return next(new ErrorHandler("Service category name is required", 400));
  }

  const existingCategory = await ServiceCategory.findOne({ name });
  if (existingCategory) {
    return next(new ErrorHandler("Service category already exists", 400));
  }

  const category = await ServiceCategory.create({ name, description, icon });

  res.status(201).json({
    success: true,
    message: "Service category created successfully",
    category,
  });
});

// @desc    Get all service categories
// @route   GET /api/service-categories
// @access  Public
export const getAllServiceCategories = asyncHandler(async (req, res, next) => {
  const categories = await ServiceCategory.find();
  res.status(200).json({
    success: true,
    categories,
  });
});

// Get single service category by ID
export const getServiceCategoryById = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler("Service category not found", 404));
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// @desc    Update a service category
// @route   PUT /api/service-categories/:id
// @access  Private (Admin only)
export const updateServiceCategory = asyncHandler(async (req, res, next) => {
  const { name, description, icon } = req.body;
  let category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Service category not found", 404));
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.icon = icon || category.icon;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Service category updated successfully",
    category,
  });
});

// @desc    Delete a service category
// @route   DELETE /api/service-categories/:id
// @access  Private (Admin only)
export const deleteServiceCategory = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler("Service category not found", 404));
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service category deleted successfully",
  });
});
