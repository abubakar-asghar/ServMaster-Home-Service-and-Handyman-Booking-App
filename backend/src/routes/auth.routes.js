import { Router } from "express";
import {
  loginUser,
  registerCustomer,
  registerServiceProvider,
  resendVerificationCode,
  saveExpoPushToken,
  verifyAuth,
  verifyUserPhone,
} from "../controllers/auth.controllers.js";
import { isAuthenticatedUser } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/login", loginUser);
router.post("/register/customer", registerCustomer);
router.post("/register/service-provider", registerServiceProvider);
router.post("/verify", verifyUserPhone);
router.post("/resend-verification", resendVerificationCode);

// Protected routes (require authentication)
router.get("/verify-logged-in", isAuthenticatedUser, verifyAuth);
router.put("/save-push-token", isAuthenticatedUser, saveExpoPushToken);
// router.post("/verify", isAuthenticatedUser, verifyUserPhone);
// router.post(
//   "/resend-verification",
//   isAuthenticatedUser,
//   resendVerificationCode
// );

export default router;
