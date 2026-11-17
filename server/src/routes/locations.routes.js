import { Router } from "express";
import * as controller from "../controllers/locations.controller.js";
import { admin } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/locations", controller.getLocations);
router.post("/locations", protect, admin, controller.postLocations);
router.post("/locations/seed-tangail", protect, admin, controller.postLocationsSeedTangail);

export default router;
