import { Router } from "express";
import * as controller from "../controllers/admin.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/admin/stats", protect, staff, controller.getAdminStats);

export default router;
