import { Router } from "express";
import * as controller from "../controllers/assignments.controller.js";
import { admin, staff, volunteerOrStaff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";
import { RequestAssignment } from "../models/index.js";
import { deleteOne } from "../controllers/adminCrud.controller.js";

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
router.get("/assignments", protect, staff, controller.getAllAssignments);
router.get("/assignments/me", protect, controller.getMyAssignments);
router.delete("/assignments/:id", protect, admin, deleteOne(RequestAssignment));
router.patch(
  "/assignments/:id/status",
  protect,
  volunteerOrStaff,
  controller.patchAssignmentsByIdStatus,
);

export default router;
