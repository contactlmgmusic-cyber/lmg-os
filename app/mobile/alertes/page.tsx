import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileAlertsPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: notifications } = await supabase.from("notifications").select("id, titre, description, niveau, type, link, lien, is_read, lu, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);

  return <div className="px-5 py-6"><header className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Centre d’attention</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Alertes</h1><p className="mt-2 text-sm text-zinc-500">Uniquement ce qui compte.</p></div><Link href="/notifications" className="pb-1 text-xs font-bold text-zinc-600">Tout gérer</Link></header>
    <div className="mt-6 space-y-2">{notifications?.length ? notifications.map((notification: any) => { const read = notification.is_read || notification.lu; const href = notification.link || notification.lien || "/notifications"; return <Link key={notification.id} href={href} className={`block rounded-[20px] border p-4 ${read ? "border-white/[0.05] bg-white/[0.015]" : "border-[#f2b705]/20 bg-[#f2b705]/[0.045]"}`}><div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.niveau === "Urgent" ? "bg-red-500" : notification.niveau === "Important" ? "bg-[#f2b705]" : "bg-zinc-600"}`} /><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-black">{notification.titre || "Notification LMG"}</h2>{!read && <span className="rounded-full bg-[#f2b705] px-1.5 py-0.5 text-[7px] font-black uppercase text-black">Nouveau</span>}</div>{notification.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{notification.description}</p>}<p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-700">{formatDate(notification.created_at)}</p></div></div></Link>; }) : <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-600">Aucune alerte.</div>}</div>
  </div>;
}

function formatDate(value: string | null) { if (!value) return "Date indisponible"; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
