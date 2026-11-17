import crypto from "node:crypto";
import { VerificationCode } from "../models/index.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

// Replace deliverCode() with a verified SMS/email provider before production.
async function deliverCode({ channel, target, code }) {
  if (env.NODE_ENV === "development") {
    console.info(`[DEV ONLY] ${channel} verification code for ${target}: ${code}`);
    return;
  }
  throw new AppError("Verification delivery provider is not configured.", 503);
}

export async function issueVerificationCode(user, channel) {
  const target = channel === "phone" ? user.phone : user.email;
  if (!target) throw new AppError(`User has no ${channel} address.`, 400);
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  await VerificationCode.deleteMany({ user: user._id, channel, consumedAt: null });
  await VerificationCode.create({
    user: user._id,
    channel,
    target,
    codeHash,
    expiresAt: new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000),
  });
  await deliverCode({ channel, target, code });
  return env.NODE_ENV === "development" && env.OTP_DEV_RETURN ? code : undefined;
}
export async function verifyCode(user, channel, code) {
  const record = await VerificationCode.findOne({
    user: user._id,
    channel,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (!record || record.attempts >= 5)
    throw new AppError("Verification code is invalid or expired.", 400);
  const candidate = crypto.createHash("sha256").update(String(code)).digest("hex");
  if (candidate !== record.codeHash) {
    record.attempts += 1;
    await record.save();
    throw new AppError("Verification code is invalid or expired.", 400);
  }
  record.consumedAt = new Date();
  await record.save();
  if (channel === "phone") user.phoneVerified = true;
  else user.emailVerified = true;
  await user.save();
}
