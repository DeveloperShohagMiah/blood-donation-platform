import { Router } from "express";
import * as controller from "../controllers/donors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.put("/donors/me", protect, controller.putDonorsMe);
router.get("/donors/me", protect, controller.getDonorsMe);
router.get("/donors/search", controller.getDonorsSearch);

export default router;
