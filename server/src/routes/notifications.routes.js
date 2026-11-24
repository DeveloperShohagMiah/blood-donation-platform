import { Router } from "express";
import * as controller from "../controllers/notifications.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/notifications", protect, controller.getNotifications);
router.get("/notifications/push/key", protect, controller.getPushKey);
router.post("/notifications/push/subscribe", protect, controller.subscribePush);
router.delete("/notifications/push/subscribe", protect, controller.unsubscribePush);
router.patch("/notifications/:id/read", protect, controller.patchNotificationsByIdRead);
router.patch("/notifications/read-all", protect, controller.patchNotificationsReadAll);

export default router;
