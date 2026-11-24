import { sendNotification, setVapidDetails } from "web-push";
import { env } from "../config/env.js";
import { PushSubscription } from "../models/index.js";

export const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

if (pushEnabled) {
  setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

/* Deliver a notification to every browser subscription of a user. */
export const sendPushToUser = async (userId, notification) => {
  if (!pushEnabled || !userId) return 0;

  const subscriptions = await PushSubscription.find({ user: userId });
  if (!subscriptions.length) return 0;

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    url: notification.link || "/dashboard/notifications",
    tag: String(notification._id),
  });

  const results = await Promise.allSettled(
    subscriptions.map((item) =>
      sendNotification(
        {
          endpoint: item.endpoint,
          keys: { p256dh: item.p256dh, auth: item.auth },
        },
        payload
      )
    )
  );

  const expired = subscriptions.filter(
    (_, index) =>
      results[index].status === "rejected" &&
      [404, 410].includes(results[index].reason?.statusCode)
  );
  if (expired.length) {
    await PushSubscription.deleteMany({ _id: { $in: expired.map((item) => item._id) } });
  }

  return results.filter((result) => result.status === "fulfilled").length;
};
