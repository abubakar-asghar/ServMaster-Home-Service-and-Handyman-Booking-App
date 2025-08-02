import Review from "../models/review.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/**
 * @desc   Create a new review
 * @route  POST /api/reviews
 * @access Private (Customer only)
 */
export const createReview = asyncHandler(async (req, res, next) => {
  const { service_request, service, service_provider, rating, comment } =
    req.body;
  const customer = req.customer; // Assuming authentication middleware sets req.customer

  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  if (!service_request || !service_provider || !rating) {
    return next(
      new ErrorHandler(
        400,
        "Service request ID, provider ID, and rating are required"
      )
    );
  }

  // Check if the service request exists
  const serviceRequest = await ServiceRequest.findById(service_request);
  if (!serviceRequest) {
    return next(new ErrorHandler(404, "Service request not found"));
  }

  // Check if the service provider exists
  const serviceProvider = await ServiceProvider.findById(service_provider);
  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  // Prevent duplicate reviews for the same service request
  const existingReview = await Review.findOne({
    service_request,
    customer: customer._id,
  });
  if (existingReview) {
    return next(
      new ErrorHandler(400, "You have already reviewed this service")
    );
  }

  const newReview = new Review({
    service_request,
    customer: customer._id,
    service,
    service_provider,
    rating,
    comment,
  });

  await newReview.save();

  serviceRequest.hasReview = true; // Update service request to indicate it has a review
  await serviceRequest.save();

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    review: newReview,
  });
});

/**
 * @desc   Get all reviews
 * @route  GET /api/reviews
 * @access Public
 */
export const getServiceProviderReviews = asyncHandler(
  async (req, res, next) => {
    const provider = req.serviceProvider; // Assuming authentication middleware sets req.serviceProvider

    const serviceProvider = await ServiceProvider.findById(provider._id);
    if (!serviceProvider) {
      return next(new ErrorHandler(404, "Service provider not found"));
    }

    const reviews = await Review.find({
      service_provider: provider._id,
    }).populate("customer", "fullName");

    res.status(200).json({
      success: true,
      reviews,
    });
  }
);

/**
 * @desc   Get a single review by ID
 * @route  GET /api/reviews/:id
 * @access Public
 */
export const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate(
    "customer",
    "fullName"
  );

  if (!review) {
    return next(new ErrorHandler(404, "Review not found"));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

/**
 * @desc    Update a review (Only the customer who created it can update)
 * @route   PUT /api/reviews/:id
 * @access  Private (Customer only)
 */
export const updateReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const customerId = req.customer.id; // Assuming authentication middleware sets req.customer

  let existingReview = await Review.findById(req.params.id);
  if (!existingReview) {
    return next(new ErrorHandler(404, "Review not found"));
  }

  // Ensure the logged-in customer is the owner of the review
  if (existingReview.customer.toString() !== customerId) {
    return next(new ErrorHandler(403, "You can only update your own review"));
  }

  existingReview.rating = rating || existingReview.rating;
  existingReview.comment = comment || existingReview.comment;

  await existingReview.save();

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review: existingReview,
  });
});

/**
 * @desc    Delete a review (Only the customer who created it can delete)
 * @route   DELETE /api/reviews/:id
 * @access  Private (Customer only)
 */
export const deleteReview = asyncHandler(async (req, res, next) => {
  const customerId = req.customer.id; // Assuming authentication middleware sets req.customer

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorHandler(404, "Review not found"));
  }

  // Ensure the logged-in customer is the owner of the review
  if (review.customer.toString() !== customerId) {
    return next(new ErrorHandler(403, "You can only delete your own review"));
  }

  await review.deleteOne();

  const serviceRequest = await ServiceRequest.findById(review.service_request);
  if (serviceRequest) {
    serviceRequest.hasReview = false;
    await serviceRequest.save();
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
