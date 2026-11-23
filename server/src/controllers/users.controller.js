import { User, Notification } from "../models/index.js";
import { ROLES, ACCOUNT_STATUS } from "../constants/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { audit, publicUser, ensureObjectId, normalizeBdPhone } from "./helpers.js";

export const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (!["true", "1"].includes(String(req.query.includeDeleted).toLowerCase()))
    filter.deletedAt = null;
  if (req.query.status) filter.accountStatus = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  send(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/* Admin-created accounts are ready to use; no public signup/OTP flow involved. */
export const createUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    email = "",
    password,
    role = ROLES.USER,
    accountStatus = ACCOUNT_STATUS.APPROVED,
  } = req.body;

  const name = String(fullName ?? "").trim();
  if (name.length < 2 || name.length > 100)
    throw new AppError("Full name must be between 2 and 100 characters.", 400);

  const normalizedPhone = normalizeBdPhone(phone);
  if (!/^\+8801[3-9]\d{8}$/.test(normalizedPhone))
    throw new AppError("Enter a valid Bangladesh mobile number.", 400);

  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
    throw new AppError("Enter a valid email address.", 400);

  const secret = String(password ?? "");
  if (secret.length < 8)
    throw new AppError("Password must be at least 8 characters.", 400);

  if (!Object.values(ROLES).includes(role)) throw new AppError("Invalid role.", 400);
  if (!Object.values(ACCOUNT_STATUS).includes(accountStatus))
    throw new AppError("Invalid account status.", 400);

  const duplicate = await User.findOne({
    $or: [
      { phone: normalizedPhone },
      ...(cleanEmail ? [{ email: cleanEmail }] : []),
    ],
  });
  if (duplicate)
    throw new AppError(
      duplicate.phone === normalizedPhone
        ? "An account with this phone number already exists."
        : "An account with this email already exists.",
      409,
    );

  const approved = accountStatus === ACCOUNT_STATUS.APPROVED;
  const user = await User.create({
    fullName: name,
    phone: normalizedPhone,
    ...(cleanEmail ? { email: cleanEmail } : {}),
    password: secret,
    role,
    accountStatus,
    phoneVerified: true,
    approvedBy: approved ? req.user._id : null,
    approvedAt: approved ? new Date() : null,
  });

  await Notification.create({
    recipient: user._id,
    title: "Account created",
    message: `An administrator created your ${role} account. You can sign in now.`,
    type: "account",
  });
  await audit(req, "user.created", "User", user._id, { role, accountStatus });

  send(res, { user: publicUser(user) }, 201, "User created.");
});

export const patchUsersByIdApproval = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id);
  const { decision, rejectionReason = "" } = req.body;
  if (!["approve", "reject", "suspend", "reinstate"].includes(decision))
    throw new AppError("Invalid approval decision.", 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);
  if (user.role === ROLES.ADMIN && req.user.role !== ROLES.ADMIN)
    throw new AppError("Only an admin can manage admin accounts.", 403);
  const status = {
    approve: ACCOUNT_STATUS.APPROVED,
    reject: ACCOUNT_STATUS.REJECTED,
    suspend: ACCOUNT_STATUS.SUSPENDED,
    reinstate: ACCOUNT_STATUS.APPROVED,
  }[decision];
  user.accountStatus = status;
  user.approvedBy = decision === "approve" || decision === "reinstate" ? req.user._id : null;
  user.approvedAt = decision === "approve" || decision === "reinstate" ? new Date() : null;
  user.rejectionReason = decision === "reject" ? rejectionReason : "";
  await user.save();
  await Notification.create({
    recipient: user._id,
    title: "Account status updated",
    message: `Your account status is now ${status}.`,
    type: "account",
  });
  await audit(req, `user.${decision}`, "User", user._id);
  send(res, { user: publicUser(user) });
});

export const patchUsersById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id);
  const { fullName, phone, email } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  if (fullName !== undefined) user.fullName = String(fullName).trim();
  if (phone !== undefined) user.phone = normalizeBdPhone(phone);
  if (email !== undefined) {
    const value = String(email).trim().toLowerCase();
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      throw new AppError("Enter a valid email address.", 400);
    user.email = value || undefined;
  }

  await user.save(); // runs schema validators and unique-index checks
  await audit(req, "user.updated", "User", user._id);
  send(res, { user: publicUser(user) });
});

/* Soft delete: keep history, block login and hide the account from normal lists. */
export const deleteUsersById = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id);
  if (String(req.params.id) === String(req.user._id))
    throw new AppError("You cannot deactivate your own account.", 400);

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);

  user.accountStatus = ACCOUNT_STATUS.SUSPENDED;
  user.deletedAt = new Date();
  await user.save();
  await audit(req, "user.deactivated", "User", user._id);
  send(res, { user: publicUser(user) }, 200, "Account deactivated.");
});

export const patchUsersByIdRole = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id);
  const { role } = req.body;
  if (!Object.values(ROLES).includes(role)) throw new AppError("Invalid role.", 400);
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select("-password");
  if (!user) throw new AppError("User not found.", 404);
  await audit(req, "user.role_changed", "User", user._id, { role });
  send(res, { user });
});
