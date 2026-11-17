import { Router } from "express";
import * as controller from "../controllers/notifications.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/notifications", protect, controller.getNotifications);
router.patch("/notifications/:id/read", protect, controller.patchNotificationsByIdRead);
router.patch("/notifications/read-all", protect, controller.patchNotificationsReadAll);

export default router;
