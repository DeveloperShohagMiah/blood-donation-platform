import { Router } from "express";
import * as controller from "../controllers/assignments.controller.js";
import { volunteerOrStaff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/blood-requests/:id/assignments",
  protect,
  volunteerOrStaff,
  controller.postBloodRequestsByIdAssignments,
);
router.get(
  "/blood-requests/:id/assignments",
  protect,
  volunteerOrStaff,
  controller.getBloodRequestsByIdAssignments,
);
router.get("/assignments/me", protect, controller.getMyAssignments);
router.patch(
  "/assignments/:id/status",
  protect,
  volunteerOrStaff,
  controller.patchAssignmentsByIdStatus,
);

export default router;
