import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MobileActivityPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: logs } = await supabase.from("activity_logs").select("id, type, titre, description, created_at").order("created_at", { ascending: false }).limit(50);
  return <div className="px-5 py-6"><header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Temps réel</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Activité</h1><p className="mt-2 text-sm text-zinc-500">Les dernières actions importantes du workspace.</p></header><div className="mt-6 rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4">{logs?.length ? logs.map((log: any) => <article key={log.id} className="flex gap-3 border-b border-white/[0.06] py-4 last:border-0"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f2b705]" /><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-700">{log.type || "Activité"}</p><h2 className="mt-1 text-sm font-black">{log.titre || "Action enregistrée"}</h2>{log.description && <p className="mt-1 text-xs leading-5 text-zinc-500">{log.description}</p>}<p className="mt-2 text-[9px] text-zinc-700">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.created_at))}</p></div></article>) : <p className="py-10 text-center text-sm text-zinc-600">Aucune activité récente.</p>}</div></div>;
}
