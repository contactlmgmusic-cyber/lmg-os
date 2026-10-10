import Link from "next/link";
import { notFound } from "next/navigation";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: project }, { data: tasks }, { data: updates }] = await Promise.all([
    supabase.from("internal_projects").select("id, titre, pole, categorie, statut, priorite, objectif, progression, deadline, owner:profiles!internal_projects_owner_id_fkey(nom, full_name)").eq("id", id).maybeSingle(),
    supabase.from("taches").select("id, titre, statut, deadline").eq("internal_project_id", id).neq("statut", "Terminé").order("deadline", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("internal_project_updates").select("id, contenu, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(3),
  ]);
  if (!project) notFound();
  const owner = Array.isArray(project.owner) ? project.owner[0] : project.owner;
  return <div className="px-5 py-6"><Link href="/mobile/projets" className="text-xs font-bold text-zinc-600">‹ Projets</Link><section className="mt-5 rounded-[26px] border border-[#f2b705]/20 bg-[#11100b] p-6"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">{project.pole || "LMG"}</p><span className="text-[10px] font-bold text-zinc-600">{project.progression || 0}%</span></div><h1 className="mt-5 text-2xl font-black leading-tight">{project.titre}</h1><p className="mt-3 text-sm leading-6 text-zinc-400">{project.objectif || project.categorie || "Objectif à préciser."}</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black"><div className="h-full rounded-full bg-[#f2b705]" style={{ width: `${Math.min(100, Number(project.progression || 0))}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3"><Info label="Statut" value={project.statut || "En cours"} /><Info label="Responsable" value={owner?.nom || owner?.full_name || "Non attribué"} /><Info label="Priorité" value={project.priorite || "Normale"} /><Info label="Échéance" value={project.deadline ? formatDate(project.deadline) : "Non définie"} /></div></section><section className="mt-7"><h2 className="text-lg font-black">Tâches ouvertes</h2><div className="mt-3 space-y-2">{tasks?.length ? tasks.map((task: any) => <Link key={task.id} href={`/mobile/taches/${task.id}`} className="flex items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{task.titre}</p><p className="mt-1 text-[10px] text-zinc-600">{task.statut || "À faire"}</p></div><span className="text-zinc-700">›</span></Link>) : <p className="rounded-[18px] border border-dashed border-white/[0.08] p-5 text-center text-xs text-zinc-600">Aucune tâche ouverte.</p>}</div></section>{updates?.length ? <section className="mt-7"><h2 className="text-lg font-black">Dernières mises à jour</h2><div className="mt-3 space-y-2">{updates.map((update: any) => <article key={update.id} className="rounded-[18px] border border-white/[0.07] bg-white/[0.02] p-4"><p className="text-xs leading-5 text-zinc-400">{update.contenu}</p><p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-zinc-700">{formatDate(update.created_at)}</p></article>)}</div></section> : null}</div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-[16px] bg-black/50 p-3"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-zinc-700">{label}</p><p className="mt-1.5 truncate text-xs font-bold text-zinc-300">{value}</p></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)); }
