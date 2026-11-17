import { User } from "../models/index.js";
import { ROLES, ACCOUNT_STATUS } from "../constants/index.js";
import { issueVerificationCode, verifyCode } from "../services/verification.service.js";
import { AppError, asyncHandler, send } from "../utils/http.js";
import { env } from "../config/env.js";
import { audit, cookieOptions, createSession, normalizeBdPhone, publicUser } from "./helpers.js";

export const postAuthRegister = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const phone = normalizeBdPhone(req.body.phone);
  if (!fullName || !phone || !password)
    throw new AppError("Full name, phone and password are required.", 400);
  if (password.length < 8) throw new AppError("Password must be at least 8 characters.", 400);
  if (!/^\+[1-9]\d{7,14}$/.test(phone))
    throw new AppError("Phone must use international format, e.g. +8801XXXXXXXXX.", 400);
  const user = await User.create({
    fullName,
    phone,
    email: email || undefined,
    password,
    role: ROLES.USER,
  });
  await audit(req, "auth.register", "User", user._id);
  send(
    res,
    { user: publicUser(user) },
    201,
    "Registration submitted. Verify your phone and wait for admin approval.",
  );
});

export const postAuthVerificationRequest = asyncHandler(async (req, res) => {
  const { identifier, channel = "phone" } = req.body;
  if (!["phone", "email"].includes(channel) || !identifier)
    throw new AppError("Identifier and valid channel are required.", 400);
  const user = await User.findOne(
    channel === "phone"
      ? { phone: normalizeBdPhone(identifier) }
      : { email: String(identifier).toLowerCase() },
  );
  if (!user) throw new AppError("Account not found.", 404);
  const devCode = await issueVerificationCode(user, channel);
  send(
    res,
    { ...(devCode ? { developmentCode: devCode } : {}) },
    200,
    "Verification code issued if delivery is configured.",
  );
});

export const postAuthVerificationConfirm = asyncHandler(async (req, res) => {
  const { identifier, channel = "phone", code } = req.body;
  if (!identifier || !code) throw new AppError("Identifier and code are required.", 400);
  const user = await User.findOne(
    channel === "phone"
      ? { phone: normalizeBdPhone(identifier) }
      : { email: String(identifier).toLowerCase() },
  ).select("+password");
  if (!user) throw new AppError("Account not found.", 404);
  await verifyCode(user, channel, code);
  send(
    res,
    { user: publicUser(user) },
    200,
    "Contact verified. Account approval is still required.",
  );
});

export const postAuthLogin = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const identifier = String(req.body.identifier ?? "").trim();
  if (!identifier || !password) throw new AppError("Identifier and password are required.", 400);
  const phone = normalizeBdPhone(identifier);
  const user = await User.findOne({
    $or: [{ phone }, { email: identifier.toLowerCase() }],
  }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid credentials.", 401);
  if (user.accountStatus !== ACCOUNT_STATUS.APPROVED)
    throw new AppError("Your account is awaiting approval or is not active.", 403);
  // Phone verification is the only verification step the UI performs, and email
  // is optional at registration. Don't lock email login behind an email OTP that
  // can never be completed from the client.
  if (!user.phoneVerified) throw new AppError("Verify your phone before login.", 403);
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie(env.COOKIE_NAME, createSession(user), cookieOptions());
  send(res, { user: publicUser(user) }, 200, "Login successful.");
});

export const postAuthLogout = (req, res) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  send(res, null, 200, "Logged out.");
};

export const getAuthMe = (req, res) => send(res, { user: publicUser(req.user) });

export const postAuthForgotPassword = asyncHandler(async (req, res) => {
  const identifier = normalizeBdPhone(String(req.body.identifier ?? "").trim());
  if (!identifier) throw new AppError("Phone number or email is required.", 400);

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier.toLowerCase() }],
  });

  // Always respond the same way so accounts cannot be enumerated.
  const genericMessage = "If the account exists, a reset code has been issued.";
  if (!user) return send(res, null, 200, genericMessage);

  const target = identifier === user.phone ? user.phone : user.email;
  const devCode = await issueVerificationCode(user, "password_reset", target);
  send(res, devCode ? { developmentCode: devCode } : null, 200, genericMessage);
});

export const postAuthResetPassword = asyncHandler(async (req, res) => {
  const identifier = normalizeBdPhone(String(req.body.identifier ?? "").trim());
  const { code, newPassword } = req.body;

  if (!identifier || !code || !newPassword)
    throw new AppError("Identifier, code and new password are required.", 400);
  if (String(newPassword).length < 8)
    throw new AppError("Password must be at least 8 characters.", 400);

  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: identifier.toLowerCase() }],
  }).select("+password");
  if (!user) throw new AppError("Invalid or expired reset code.", 400);

  await verifyCode(user, "password_reset", String(code));

  user.password = String(newPassword); // pre-save hook hashes it
  await user.save();

  send(res, null, 200, "Password reset. You can log in with your new password.");
});
