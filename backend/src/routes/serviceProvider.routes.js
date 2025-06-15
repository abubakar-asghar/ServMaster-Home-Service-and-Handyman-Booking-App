// routes/serviceProvider.routes.js

import { Router } from "express";
import {
  registerServiceProvider,
  updatePersonalInfo,
  updateBusinessInfo,
  updatePassword,
  uploadWorkImages,
  getServiceProviderProfile,
  uploadCNICImages,
  uploadSelfie,
  addServices,
  getAllServiceProviders,
  updatePhoneVerification,
  updateIdentityVerification,
  updateProfessionalVerification,
  getServiceProvidersByService,
} from "../controllers/serviceProvider.controllers.js";

// import { authenticateUser } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import { isAuthenticatedServiceProvider } from "../middlewares/authMiddleware.js";

const router = Router();

// Admin/Management Route
router.get("/all", getAllServiceProviders);

// Public Route
router.post("/register", registerServiceProvider);

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
  updateBusinessInfo
);
router.put("/change-password", isAuthenticatedServiceProvider, updatePassword);
router.put(
  "/phone-verification",
  isAuthenticatedServiceProvider,
  updatePhoneVerification
);
router.put(
  "/identity-verification",
  isAuthenticatedServiceProvider,
  updateIdentityVerification
);
router.put(
  "/professional-verification",
  isAuthenticatedServiceProvider,
  updateProfessionalVerification
);

router.post("/upload/work-images", upload.array("images", 5), uploadWorkImages);
router.post(
  "/upload/cnic",
  upload.fields([
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
  ]),
  uploadCNICImages
);
router.post("/upload/selfie", upload.single("selfie"), uploadSelfie);

router.put("/add-services", addServices);

// Getting all ServiceProviders of specific Service ID
router.get("/services/:serviceId", getServiceProvidersByService);

export default router;
