import { Router } from "express";
import {
  createReview,
  getServiceProviderReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/review.controllers.js";
import { isAuthenticatedCustomer } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/").post(isAuthenticatedCustomer, createReview);
router
  .route("/:id")
  .get(getReviewById)
  .put(isAuthenticatedCustomer, updateReview)
  .delete(isAuthenticatedCustomer, deleteReview);
router.route("/provider/:service_provider_id").get(getServiceProviderReviews);

export default router;
