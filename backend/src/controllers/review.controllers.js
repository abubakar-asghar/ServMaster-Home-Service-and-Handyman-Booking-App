import Review from "../models/review.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc   Create a new review
// @route  POST /api/reviews
// @access Private (Customer only)
export const createReview = asyncHandler(async (req, res, next) => {
  const { service_request_id, service_provider_id, rating, review } = req.body;
  const customer_id = req.customer.id; // Assuming authentication middleware sets req.customer

  if (!service_request_id || !service_provider_id || !rating) {
    return next(new ErrorHandler("Service request ID, provider ID, and rating are required", 400));
  }

  // Check if the service request exists
  const serviceRequest = await ServiceRequest.findById(service_request_id);
  if (!serviceRequest) {
    return next(new ErrorHandler("Service request not found", 404));
  }

  // Check if the customer exists
  const customer = await Customer.findById(customer_id);
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  // Check if the service provider exists
  const serviceProvider = await ServiceProvider.findById(service_provider_id);
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  // Prevent duplicate reviews for the same service request
  const existingReview = await Review.findOne({ service_request_id, customer_id });
  if (existingReview) {
    return next(new ErrorHandler("You have already reviewed this service", 400));
  }

  const newReview = await Review.create({
    service_request_id,
    customer_id,
    service_provider_id,
    rating,
    review,
  });

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    review: newReview,
  });
});

// @desc   Get all reviews
// @route  GET /api/reviews
// @access Public
export const getServiceProviderReviews = asyncHandler(async (req, res, next) => {
  const { service_provider_id } = req.params;

  const serviceProvider = await ServiceProvider.findById(service_provider_id);
  if (!serviceProvider) {
    return next(new ErrorHandler("Service provider not found", 404));
  }

  const reviews = await Review.find({ service_provider_id }).populate("customer_id", "name");

  res.status(200).json({
    success: true,
    reviews,
  });
});

// @desc   Get a single review by ID
// @route  GET /api/reviews/:id
// @access Public
export const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate("customer_id", "name");

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// @desc    Update a review (Only the customer who created it can update)
// @route   PUT /api/reviews/:id
// @access  Private (Customer only)
export const updateReview = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;
  const customer_id = req.customer.id; // Assuming authentication middleware sets req.customer

  let existingReview = await Review.findById(req.params.id);
  if (!existingReview) {
    return next(new ErrorHandler("Review not found", 404));
  }

  // Ensure the logged-in customer is the owner of the review
  if (existingReview.customer_id.toString() !== customer_id) {
    return next(new ErrorHandler("You can only update your own review", 403));
  }

  existingReview.rating = rating || existingReview.rating;
  existingReview.review = review || existingReview.review;

  await existingReview.save();

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review: existingReview,
  });
});

// @desc    Delete a review (Only the customer who created it can delete)
// @route   DELETE /api/reviews/:id
// @access  Private (Customer only)
export const deleteReview = asyncHandler(async (req, res, next) => {
  const customer_id = req.customer.id; // Assuming authentication middleware sets req.customer

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  // Ensure the logged-in customer is the owner of the review
  if (review.customer_id.toString() !== customer_id) {
    return next(new ErrorHandler("You can only delete your own review", 403));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
