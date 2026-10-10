import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MobileValidationsPage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR]);
  const supabase = await createAuthenticatedSupabaseClient();
  const isManager = profile.role === ROLES.MANAGER;
  let query = supabase.from("artist_approvals").select(isManager ? "*, artistes!inner(id, nom, manager_id)" : "*, artistes(id, nom)");
  if (isManager) query = query.eq("artistes.manager_id", profile.id);
  const { data: validations } = await query.order("created_at", { ascending: false });
  return <div className="px-5 py-6"><header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Artist approvals</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Validations</h1><p className="mt-2 text-sm text-zinc-500">Les décisions artistiques à suivre.</p></header><div className="mt-6 space-y-3">{validations?.length ? validations.map((item: any) => <article key={item.id} className="rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-5"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f2b705]">{item.type || "Validation"} · {item.artistes?.nom || "Artiste"}</p><span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[9px] font-bold text-zinc-500">{item.statut || "En attente"}</span></div><h2 className="mt-3 text-base font-black">{item.titre}</h2>{item.description && <p className="mt-2 text-xs leading-5 text-zinc-500">{item.description}</p>}{item.reponse_artiste && <p className="mt-3 text-xs text-[#f2b705]">Réponse : {item.reponse_artiste}</p>}</article>) : <p className="rounded-[18px] border border-dashed border-white/[0.08] p-8 text-center text-sm text-zinc-600">Aucune validation.</p>}</div></div>;
}
