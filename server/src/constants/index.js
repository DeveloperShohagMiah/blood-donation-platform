export const ROLES = Object.freeze({
  USER: "user",
  VOLUNTEER: "volunteer",
  MODERATOR: "moderator",
  ADMIN: "admin",
});
export const ACCOUNT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
});
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const REQUEST_STATUS = Object.freeze({
  SUBMITTED: "submitted",
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  MATCHING: "matching",
  IN_PROGRESS: "in_progress",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
});
export const DONOR_AVAILABILITY = ["available", "unavailable", "temporarily_unavailable"];
export const DONOR_COOLDOWN_DAYS = 90;
