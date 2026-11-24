import { Router } from "express";
import * as controller from "../controllers/analytics.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/analytics", protect, staff, controller.getAnalytics);
router.get("/analytics/export/requests.csv", protect, staff, controller.exportRequestsCsv);
router.get("/analytics/export/donations.csv", protect, staff, controller.exportDonationsCsv);

export default router;
