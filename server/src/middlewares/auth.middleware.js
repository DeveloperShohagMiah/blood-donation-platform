import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/http.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.[env.COOKIE_NAME] ||
    (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
  if (!token) throw new AppError("Authentication required.", 401);
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired session.", 401);
  }
  const user = await User.findById(payload.sub);
  if (!user || user.accountStatus !== "approved") throw new AppError("Account is not active.", 403);
  req.user = user;
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new AppError("You do not have permission.", 403));
    next();
  };
