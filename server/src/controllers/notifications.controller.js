import { Notification, PushSubscription } from "../models/index.js";
import { env } from "../config/env.js";
import { pushEnabled } from "../services/push.service.js";
import { AppError, asyncHandler, send } from "../utils/http.js";

export const getPushKey = asyncHandler(async (req, res) => {
  send(res, { enabled: pushEnabled, publicKey: env.VAPID_PUBLIC_KEY });
});

export const subscribePush = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth)
    throw new AppError("Invalid push subscription.", 400);

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      user: req.user._id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { upsert: true, new: true, runValidators: true },
  );
  send(res, { success: true }, 200, "Push notifications enabled.");
});

export const unsubscribePush = asyncHandler(async (req, res) => {
  const { endpoint } = req.body || {};
  if (endpoint) await PushSubscription.deleteOne({ endpoint, user: req.user._id });
  else await PushSubscription.deleteMany({ user: req.user._id });
  send(res, { success: true }, 200, "Push notifications disabled.");
});

export const getNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  send(res, { items });
});

export const patchNotificationsByIdRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { readAt: new Date() },
    { new: true },
  );
  if (!item) throw new AppError("Notification not found.", 404);
  send(res, { item });
});

export const patchNotificationsReadAll = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { readAt: new Date() },
  );
  send(res, { modifiedCount: result.modifiedCount });
});
