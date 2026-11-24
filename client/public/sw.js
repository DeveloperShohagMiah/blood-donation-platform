/* Blood Connect service worker — shows push notifications and opens the app. */

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Blood Connect", {
      body: payload.body || "You have a new notification.",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: payload.tag || "blood-connect",
      data: { url: payload.url || "/dashboard/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/dashboard/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) => client.url.includes(target));
        if (existing) return existing.focus();
        return self.clients.openWindow(target);
      })
  );
});
