import { Router } from "express";
import {
  updatePersonalInfo,
  updateBusinessInfo,
  updatePassword,
  uploadWorkImages,
  getServiceProviderProfile,
  uploadIdentityDocuments,
  addServices,
  deleteService,
  updateService,
  getAllServiceProviders,
  updatePhoneVerification,
  updateProfessionalVerification,
  getServiceProvidersByService,
  getServiceProviderProfileForCustomer,
  getProviderDashboardStats,
  getBookedTimeSlots,
  getServiceDetails
} from "../controllers/serviceProvider.controllers.js";

// import { authenticateUser } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import { isAuthenticatedServiceProvider } from "../middlewares/authMiddleware.js";

const router = Router();

// Admin/Management Route
router.get("/all", getAllServiceProviders);
// Getting all ServiceProviders of specific Service ID
router.get("/all/:serviceId", getServiceProvidersByService);
// Get Service Provider Stats dashboard page (Home Page)
router.get(
  "/dashboard",
  isAuthenticatedServiceProvider,
  getProviderDashboardStats
);
// Protected Routes
// router.use(authenticateUser);

router.get("/me", isAuthenticatedServiceProvider, getServiceProviderProfile);
router.put(
  "/personal-info",
  isAuthenticatedServiceProvider,
  updatePersonalInfo
);
router.put(
  "/business-info",
  isAuthenticatedServiceProvider,
  upload.single("profileImage"),
  updateBusinessInfo
);
router.put("/change-password", isAuthenticatedServiceProvider, updatePassword);
router.put(
  "/phone-verification",
  isAuthenticatedServiceProvider,
  updatePhoneVerification
);
router.put(
  "/professional-verification",
  isAuthenticatedServiceProvider,
  updateProfessionalVerification
);

router.post("/upload/work-images", upload.array("images", 5), uploadWorkImages);
router.put(
  "/identity-verification",
  isAuthenticatedServiceProvider,
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
  ]),
  uploadIdentityDocuments
);

router.post("/add-services", isAuthenticatedServiceProvider, addServices);
router.get("/service-detail/:serviceId", isAuthenticatedServiceProvider, getServiceDetails)
router.delete(
  "/services/:serviceId",
  isAuthenticatedServiceProvider,
  deleteService
);
router.put(
  "/services/:serviceId",
  isAuthenticatedServiceProvider,
  updateService
);

router.get("/booked-time-slots/:id", getBookedTimeSlots);

router.get("/profile/:id", getServiceProviderProfileForCustomer);

export default router;
