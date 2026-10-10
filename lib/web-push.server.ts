import "server-only";

import webpush from "web-push";

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("Les clés VAPID ne sont pas configurées.");
  webpush.setVapidDetails("mailto:contact@legacymusicgroup.fr", publicKey, privateKey);
  return webpush;
}

export async function sendPush(subscription: { endpoint: string; p256dh: string; auth_key: string }, payload: object) {
  return configureWebPush().sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } }, JSON.stringify(payload));
}
