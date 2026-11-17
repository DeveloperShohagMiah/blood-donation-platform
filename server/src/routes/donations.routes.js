import { Router } from "express";
import * as controller from "../controllers/donations.controller.js";
import { volunteerOrStaff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/donations/me", protect, controller.getMyDonations);
router.post("/donations", protect, volunteerOrStaff, controller.postDonations);
router.get("/donations", protect, volunteerOrStaff, controller.getDonations);

export default router;
