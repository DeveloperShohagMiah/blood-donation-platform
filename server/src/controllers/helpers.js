import jwt from "jsonwebtoken";
import { AuditLog, Location, RequestAssignment } from "../models/index.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

export const audit = (req, action, resourceType, resourceId, metadata = {}) =>
  AuditLog.create({
    actor: req.user?._id || null,
    action,
    resourceType,
    resourceId,
    metadata,
    ip: req.ip,
  });
export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
  maxAge: env.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
});
export const createSession = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
export const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  phone: user.phone,
  email: user.email,
  role: user.role,
  accountStatus: user.accountStatus,
  phoneVerified: user.phoneVerified,
  emailVerified: user.emailVerified,
});
export const ensureObjectId = (id) => {
  if (!/^[a-f\d]{24}$/i.test(String(id))) throw new AppError("Invalid identifier.", 400);
};

/* Accept the phone formats a user is likely to type and store one canonical form. */
export const normalizeBdPhone = (value) => {
  const raw = String(value ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
  if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
  return raw;
};
export const validateLocation = async ({ division, district, upazila }) => {
  const [div, dist, upa] = await Promise.all([
    Location.findById(division),
    Location.findById(district),
    upazila ? Location.findById(upazila) : null,
  ]);
  if (
    !div ||
    div.type !== "division" ||
    !dist ||
    dist.type !== "district" ||
    String(dist.parent) !== String(div._id)
  )
    throw new AppError("Invalid division/district hierarchy.", 400);
  if (upa && (upa.type !== "upazila" || String(upa.parent) !== String(dist._id)))
    throw new AppError("Invalid upazila hierarchy.", 400);
};
export const activeAssignmentCount = (volunteerId) =>
  RequestAssignment.countDocuments({ volunteer: volunteerId, status: "active" });
