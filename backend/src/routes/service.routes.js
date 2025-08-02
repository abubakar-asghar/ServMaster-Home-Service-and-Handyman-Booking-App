import { Router } from "express";
import {
  createService,
  createMultipleServices,
  getAllServices,
  getServicesByParent,
  getServiceById,
  updateService,
  deleteService,
  updateIconOfServices,
} from "../controllers/service.controllers.js";

const router = Router();

router.route("/create").post(createService);
router.route("/bulk-create").post(createMultipleServices);
router.route("/all").get(getAllServices);
router.route("/parent/:parentId").get(getServicesByParent);
router.route("/update-icon").put(updateIconOfServices);
router
  .route("/:id")
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);


export default router;
