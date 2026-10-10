import Link from "next/link";
import { notFound } from "next/navigation";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: task } = await supabase.from("taches").select("id, titre, description, statut, priorite, deadline, responsable_id, created_at").eq("id", id).maybeSingle();
  if (!task) notFound();
  return <div className="px-5 py-6"><Link href="/mobile/taches" className="text-xs font-bold text-zinc-600">‹ Mes tâches</Link><section className="mt-5 rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-6"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">{task.priorite || "Priorité normale"}</p><span className="rounded-full bg-zinc-900 px-3 py-1 text-[9px] font-bold text-zinc-500">{task.statut || "À faire"}</span></div><h1 className="mt-5 text-2xl font-black leading-tight">{task.titre}</h1>{task.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{task.description}</p>}<div className="mt-6 border-t border-white/[0.07] pt-5"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-700">Échéance</p><p className="mt-2 text-sm font-bold">{task.deadline ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${task.deadline}T12:00:00`)) : "Aucune échéance"}</p></div></section><Link href={`/taches/${task.id}`} className="mt-4 block rounded-[18px] border border-white/[0.08] px-4 py-4 text-center text-sm font-black text-zinc-300">Ouvrir l’espace complet de la tâche</Link></div>;
}
