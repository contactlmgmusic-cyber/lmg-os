import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/web-push.server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });
  const { data: notifications, error } = await admin.from("notifications").select("id,user_id,titre,description,lien,link").is("push_sent_at", null).order("created_at").limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let sent = 0;
  for (const notification of notifications || []) {
    const { data: subscriptions } = await admin.from("push_subscriptions").select("id,endpoint,p256dh,auth_key").eq("user_id", notification.user_id);
    for (const subscription of subscriptions || []) {
      try { await sendPush(subscription, { title: notification.titre || "LMG ADMIN", body: notification.description || "Nouvelle notification LMG", url: mobileLink(notification.lien || notification.link), icon: "/logo-lmg-v2.png" }); sent += 1; }
      catch (failure: any) { if (failure?.statusCode === 404 || failure?.statusCode === 410) await admin.from("push_subscriptions").delete().eq("id", subscription.id); }
    }
    await admin.from("notifications").update({ push_sent_at: new Date().toISOString() }).eq("id", notification.id);
  }
  return NextResponse.json({ success: true, notifications: notifications?.length || 0, pushes: sent });
}

function mobileLink(value?: string | null) { if (!value) return "/mobile/alertes"; return value.replace(/^\/evenements\//, "/mobile/agenda/interne/").replace(/^\/taches\//, "/mobile/taches/").replace(/^\/booking\//, "/mobile/agenda/bookings/"); }
