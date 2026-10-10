import "server-only";

import { randomBytes } from "node:crypto";
import webpush from "web-push";
import { createServiceSupabaseClient } from "@/lib/service-supabase.server";

export type PushSecrets = {
  publicKey: string;
  privateKey: string;
  cronSecret: string;
};

let cachedSecrets: PushSecrets | null = null;

export async function getOrCreatePushSecrets(): Promise<PushSecrets> {
  if (cachedSecrets) return cachedSecrets;

  const admin = createServiceSupabaseClient();
  const { data, error } = await admin
    .from("app_secrets")
    .select("key,value")
    .in("key", ["vapid_public_key", "vapid_private_key", "push_cron_secret"]);

  if (error) throw new Error(`Impossible de lire la configuration push : ${error.message}`);
  const values = new Map((data || []).map((entry) => [entry.key, entry.value]));
  let publicKey = values.get("vapid_public_key");
  let privateKey = values.get("vapid_private_key");
  let cronSecret = values.get("push_cron_secret");

  if (!publicKey || !privateKey) {
    const generated = webpush.generateVAPIDKeys();
    publicKey = generated.publicKey;
    privateKey = generated.privateKey;
  }
  cronSecret ||= randomBytes(32).toString("base64url");

  const { error: saveError } = await admin.from("app_secrets").upsert([
    { key: "vapid_public_key", value: publicKey },
    { key: "vapid_private_key", value: privateKey },
    { key: "push_cron_secret", value: cronSecret },
  ]);
  if (saveError) throw new Error(`Impossible d'enregistrer la configuration push : ${saveError.message}`);

  cachedSecrets = { publicKey, privateKey, cronSecret };
  return cachedSecrets;
}

