import { Router } from "express";
import * as controller from "../controllers/campaigns.controller.js";
import { staff } from "./route-guards.js";
import { optionalAuth, protect } from "../middlewares/auth.middleware.js";
import { Campaign } from "../models/index.js";
import { deleteOne } from "../controllers/adminCrud.controller.js";

const router = Router();

router.get("/campaigns", optionalAuth, controller.getCampaigns);
router.post("/campaigns", protect, staff, controller.postCampaigns);
router.post("/campaigns/:id/signup", protect, controller.postCampaignSignup);
router.delete("/campaigns/:id/signup", protect, controller.deleteCampaignSignup);
router.get("/campaigns/:id/signups", protect, staff, controller.getCampaignSignups);
router.get("/campaigns/:id", protect, staff, controller.getCampaignById);
router.patch("/campaigns/:id", protect, staff, controller.patchCampaignsById);
router.delete("/campaigns/:id", protect, staff, deleteOne(Campaign));

export default router;
