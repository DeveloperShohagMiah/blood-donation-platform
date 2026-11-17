import { Router } from "express";
import * as controller from "../controllers/blood-requests.controller.js";
import { volunteerOrStaff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/blood-requests", protect, controller.postBloodRequests);
router.patch("/blood-requests/:id/cancel", protect, controller.patchBloodRequestsByIdCancel);
router.get("/blood-requests", protect, controller.getBloodRequests);
router.get("/blood-requests/public", controller.getPublicBloodRequests);
router.get("/blood-requests/:id", protect, controller.getBloodRequestsById);
router.patch(
  "/blood-requests/:id/verify",
  protect,
  volunteerOrStaff,
  controller.patchBloodRequestsByIdVerify,
);

export default router;
