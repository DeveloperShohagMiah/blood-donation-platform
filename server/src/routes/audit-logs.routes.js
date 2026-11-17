import { Router } from "express";
import * as controller from "../controllers/audit-logs.controller.js";
import { staff } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/audit-logs", protect, staff, controller.getAuditLogs);

export default router;
