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
} from "../controllers/serviceProvider.controllers.js";

// import { authenticateUser } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

// Public Route
router.post("/register", registerServiceProvider);
router.get("/:serviceId", getServiceProviderProfile);

// Protected Routes
// router.use(authenticateUser);

router.get("/me", getServiceProviderProfile);
router.put("/personal-info", updatePersonalInfo);
router.put("/business-info", updateBusinessInfo);
router.put("/change-password", updatePassword);
router.put("/phone-verification", updatePhoneVerification);
router.put("/identity-verification", updateIdentityVerification);
router.put("/professional-verification", updateProfessionalVerification);

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

router.put("/services", addServices);

// Admin/Management Route
router.get("/all", getAllServiceProviders);

export default router;
