import { Router } from "express";
import {
  registerCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controllers.js";
import {
  isAuthenticatedCustomer,
  isAuthenticatedAdmin,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerCustomer);
router.get("/", isAuthenticatedAdmin, getAllCustomers);
router.get("/:id", isAuthenticatedCustomer, getCustomerById);
router.put("/:id", isAuthenticatedCustomer, updateCustomer);
router.delete("/:id", isAuthenticatedAdmin, deleteCustomer);

export default router;
