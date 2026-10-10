import "server-only";

import webpush from "web-push";
import { getOrCreatePushSecrets } from "@/lib/push-secrets.server";

export async function configureWebPush() {
  const { publicKey, privateKey } = await getOrCreatePushSecrets();
  webpush.setVapidDetails("mailto:contact@legacymusicgroup.fr", publicKey, privateKey);
  return webpush;
}

export async function sendPush(subscription: { endpoint: string; p256dh: string; auth_key: string }, payload: object) {
  const push = await configureWebPush();
  return push.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } }, JSON.stringify(payload));
}
