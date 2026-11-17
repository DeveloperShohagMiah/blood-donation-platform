import { Router } from "express";
import * as controller from "../controllers/donor-responses.controller.js";
import { volunteerOrStaff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/blood-requests/:id/responses", protect, controller.postBloodRequestsByIdResponses);
router.get(
  "/blood-requests/:id/responses",
  protect,
  volunteerOrStaff,
  controller.getBloodRequestsByIdResponses,
);

export default router;
