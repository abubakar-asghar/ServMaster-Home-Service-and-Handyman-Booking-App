import { Router } from "express";
import {
  adminLogin,
  createAdmin,
  getAllCustomers,
  getAllServiceProviders,
  deleteCustomer,
  deleteServiceProvider,
  getAdminProfile,
  getServiceProviderDetails,
  updateServiceProviderVerification,
  getCustomerDetails,
  createNewServiceCategory,
  getAllServiceCategories,
  getServiceCategoryDetail,
  deleteServiceCategory,
  updateServiceCategory,
  getAllServices,
  createNewService,
  getServiceDetail,
  updateService,
  deleteService,
  getDashboardOverview,
  getDashboardStatistics,
  getAllReviews,
  getReviewStats,
  deleteReview,
} from "../controllers/admin.controllers.js";
import {
  isAuthenticatedAdmin,
  isSuperAdmin,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

/////////////////////// ----- ADMIN PERSONAL ROUTES ---- ///////////////////////
router.post("/login", adminLogin);

router.get("/profile", isAuthenticatedAdmin, getAdminProfile);

router.post("/create", createAdmin);

/////////////////////// ----- ADMIN PERSONAL ROUTES ---- ///////////////////////
router.get("/dashboard/overview", getDashboardOverview);
router.get("/dashboard/statistics", getDashboardStatistics);

////////////////////////// ---- CUSTOMERS ROUTES ---- //////////////////////////
router.get("/customers", isAuthenticatedAdmin, getAllCustomers);
router
  .route("/customer/:id")
  .get(isAuthenticatedAdmin, getCustomerDetails)
  .put(isAuthenticatedAdmin, getCustomerDetails)
  .delete(isAuthenticatedAdmin, deleteCustomer);

////////////////////// ---- SERVICE PROVIDERS ROUTES ---- //////////////////////
router.get("/service-providers", isAuthenticatedAdmin, getAllServiceProviders);
router
  .route("/service-provider/:id")
  .get(isAuthenticatedAdmin, getServiceProviderDetails)
  .put(isAuthenticatedAdmin, updateServiceProviderVerification)
  .delete(isAuthenticatedAdmin, deleteServiceProvider);

////////////////////// ---- SERVICE CATEGORY ROUTES ---- //////////////////////
router.post(
  "/service-category/create",
  upload.single("icon"),
  createNewServiceCategory
);
router.get("/service-categories", getAllServiceCategories);
router
  .route("/service-category/:id")
  .get(getServiceCategoryDetail)
  .put(upload.single("icon"), updateServiceCategory)
  .delete(deleteServiceCategory);

////////////////////////// ---- SERVICES ROUTES ---- //////////////////////////
router.post("/service/create", createNewService);
router.get("/services", getAllServices);
router
  .route("/service/:id")
  .get(getServiceDetail)
  .put(updateService)
  .delete(deleteService);

////////////////////////// ---- REVIEWS ROUTES ---- //////////////////////////
router.get("/reviews", getAllReviews);
router.get("/reviews/stats", getReviewStats);
router.delete("/reviews/:id", deleteReview);

export default router;
