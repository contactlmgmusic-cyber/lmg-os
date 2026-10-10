self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "LMG ADMIN", { body: data.body || "Nouvelle notification LMG", icon: data.icon || "/logo-lmg-v2.png", badge: "/logo-lmg-v2.png", data: { url: data.url || "/mobile/alertes" }, tag: data.tag || "lmg-admin", renotify: true }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); const target = new URL(event.notification.data?.url || "/mobile/alertes", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => { for (const client of windows) { if (client.url.startsWith(self.location.origin) && "focus" in client) { client.navigate(target); return client.focus(); } } return clients.openWindow(target); }));
});
