import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { sendPush } from "@/lib/web-push.server";

export async function POST() {
  const supabase = await createAuthenticatedSupabaseClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data: subscriptions } = await supabase.from("push_subscriptions").select("endpoint,p256dh,auth_key").eq("user_id", user.id);
  if (!subscriptions?.length) return NextResponse.json({ error: "Aucun téléphone abonné" }, { status: 404 });
  await Promise.allSettled(subscriptions.map((subscription) => sendPush(subscription, { title: "LMG ADMIN", body: "Les notifications push sont activées sur cet appareil.", url: "/mobile/alertes", icon: "/logo-lmg-v2.png" })));
  return NextResponse.json({ success: true });
}
