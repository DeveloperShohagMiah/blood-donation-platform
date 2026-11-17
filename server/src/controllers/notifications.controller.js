import { Notification } from "../models/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";

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
