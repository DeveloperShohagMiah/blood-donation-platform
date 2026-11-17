import { Router } from "express";
import * as controller from "../controllers/campaigns.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/campaigns", controller.getCampaigns);
router.post("/campaigns", protect, staff, controller.postCampaigns);
router.patch("/campaigns/:id", protect, staff, controller.patchCampaignsById);

export default router;
