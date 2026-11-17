import { Router } from "express";
import * as controller from "../controllers/gallery.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/gallery", controller.getGallery);
router.get("/gallery/:id", protect, staff, controller.getGalleryById);
router.post("/gallery", protect, staff, controller.postGallery);
router.patch("/gallery/:id", protect, staff, controller.patchGalleryById);
router.delete("/gallery/:id", protect, staff, controller.deleteGalleryById);

export default router;
