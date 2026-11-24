import { Router } from "express";
import * as controller from "../controllers/messages.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/blood-requests/:id/messages", protect, controller.getRequestMessages);
router.post("/blood-requests/:id/messages", protect, controller.postRequestMessage);

export default router;
