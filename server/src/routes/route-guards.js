import rateLimit from "express-rate-limit";
import { ROLES } from "../constants/index.js";
import { authorize } from "../middlewares/auth.middleware.js";
export const admin = authorize(ROLES.ADMIN);
export const staff = authorize(ROLES.ADMIN, ROLES.MODERATOR);
export const volunteerOrStaff = authorize(ROLES.ADMIN, ROLES.MODERATOR, ROLES.VOLUNTEER);
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
