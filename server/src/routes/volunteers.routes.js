import { Router } from "express";
import * as controller from "../controllers/volunteers.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/volunteers/me", protect, controller.getVolunteersMe);
router.put("/volunteers/me", protect, controller.putVolunteersMe);
router.get("/volunteers", protect, staff, controller.getVolunteers);

export default router;
