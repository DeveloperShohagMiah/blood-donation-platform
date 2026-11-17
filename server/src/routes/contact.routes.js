import { Router } from "express";
import * as controller from "../controllers/contact.controller.js";
import { authLimiter } from "./route-guards.js";

const router = Router();

router.post("/contact", authLimiter, controller.postContactMessage);

export default router;
