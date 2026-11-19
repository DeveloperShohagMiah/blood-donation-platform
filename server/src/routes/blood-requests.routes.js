import { Router } from "express";
import * as controller from "../controllers/blood-requests.controller.js";
import { admin, volunteerOrStaff } from "./route-guards.js";
import { optionalAuth, protect } from "../middlewares/auth.middleware.js";
import { BloodRequest } from "../models/index.js";
import { deleteOne, updateOne } from "../controllers/adminCrud.controller.js";

const router = Router();

router.post("/blood-requests", protect, controller.postBloodRequests);
router.patch("/blood-requests/:id/cancel", protect, controller.patchBloodRequestsByIdCancel);
router.get("/blood-requests", protect, controller.getBloodRequests);
router.get("/blood-requests/public", optionalAuth, controller.getPublicBloodRequests);
router.patch(
  "/blood-requests/:id",
  protect,
  admin,
  updateOne(BloodRequest, [
    "patientName",
    "bloodGroup",
    "urgency",
    "units",
    "hospitalName",
    "hospitalAddress",
    "division",
    "district",
    "upazila",
    "neededAt",
    "contactName",
    "contactPhone",
    "details",
    "status",
  ])
);
router.delete("/blood-requests/:id", protect, admin, deleteOne(BloodRequest));
router.get("/blood-requests/:id", protect, controller.getBloodRequestsById);
router.patch(
  "/blood-requests/:id/verify",
  protect,
  volunteerOrStaff,
  controller.patchBloodRequestsByIdVerify,
);

export default router;
