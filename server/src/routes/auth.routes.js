import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { authLimiter } from "./route-guards.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/register", authLimiter, controller.postAuthRegister);
router.post("/auth/verification/request", authLimiter, controller.postAuthVerificationRequest);
router.post("/auth/verification/confirm", authLimiter, controller.postAuthVerificationConfirm);
router.post("/auth/login", authLimiter, controller.postAuthLogin);
router.post("/auth/password/forgot", authLimiter, controller.postAuthForgotPassword);
router.post("/auth/password/reset", authLimiter, controller.postAuthResetPassword);
router.post("/auth/logout", controller.postAuthLogout);
router.get("/auth/me", protect, controller.getAuthMe);

export default router;
