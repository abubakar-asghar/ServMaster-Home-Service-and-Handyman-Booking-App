import { Router } from "express";
import {
  createSubService,
  getAllSubServices,
  getSubServicesByParent,
  getSubServiceById,
  updateSubService,
  deleteSubService,
} from "../controllers/subService.controllers.js";

const router = Router();

router.route("/").post(createSubService).get(getAllSubServices);
router.route("/parent/:parentId").get(getSubServicesByParent);
router
  .route("/:id")
  .get(getSubServiceById)
  .put(updateSubService)
  .delete(deleteSubService);

export default router;
