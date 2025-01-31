import { Router } from "express";
import {
  createServiceCategory,
  getAllServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  deleteServiceCategory,
} from "../controllers/serviceCategory.controllers.js";

const router = Router();

router.route("/").post(createServiceCategory).get(getAllServiceCategories);
router
  .route("/:id")
  .get(getServiceCategoryById)
  .put(updateServiceCategory)
  .delete(deleteServiceCategory);

export default router;
