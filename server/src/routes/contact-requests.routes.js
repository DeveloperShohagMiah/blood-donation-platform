import { Router } from "express";
import * as controller from "../controllers/contact-requests.controller.js";
import { staff, authLimiter } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/contact-requests", authLimiter, controller.postContactRequests);
router.get("/contact-requests", protect, staff, controller.getContactRequests);
router.patch(
  "/contact-requests/:id/status",
  protect,
  staff,
  controller.patchContactRequestsByIdStatus,
);

export default router;
