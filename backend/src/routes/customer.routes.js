import { Router } from "express";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addFavoriteProvider,
  removeFavoriteProvider,
  getFavoriteProviders,
  checkFavoriteProvider,
  getFavoriteServices,
  addFavoriteService,
  checkFavoriteService,
  removeFavoriteService,
} from "../controllers/customer.controllers.js";
import {
  isAuthenticatedCustomer,
  isAuthenticatedAdmin,
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router.get("/all", isAuthenticatedAdmin, getAllCustomers);
router.get(
  "/favourite-providers",
  isAuthenticatedCustomer,
  getFavoriteProviders
);
router.post(
  "/favourite-providers/new",
  isAuthenticatedCustomer,
  addFavoriteProvider
);
router
  .route("/favourite-providers/:id")
  .get(isAuthenticatedCustomer, checkFavoriteProvider)
  .delete(isAuthenticatedCustomer, removeFavoriteProvider);
router.get("/favourite-services", isAuthenticatedCustomer, getFavoriteServices);
router.post(
  "/favourite-services/new",
  isAuthenticatedCustomer,
  addFavoriteService
);
router
  .route("/favourite-services/:id")
  .get(isAuthenticatedCustomer, checkFavoriteService)
  .delete(isAuthenticatedCustomer, removeFavoriteService);
router.get("/:id", isAuthenticatedCustomer, getCustomerById);
router.put(
  "/:id",
  isAuthenticatedCustomer,
  upload.single("profileImage"),
  updateCustomer
);
router.delete("/:id", isAuthenticatedAdmin, deleteCustomer);

export default router;
