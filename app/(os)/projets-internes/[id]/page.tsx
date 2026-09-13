import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
function date(value: string | null) { return value ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Non définie"; }
export default async function InternalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER]);
  const { id } = await params; const supabase = await createAuthenticatedSupabaseClient();
  const { data: project, error } = await supabase.from("internal_projects").select("*, owner:profiles!internal_projects_owner_id_fkey(id, nom, full_name)").eq("id", id).single();
  if (error || !project) return <main className="p-10 text-white"><p className="text-red-400">Projet interne introuvable.</p></main>;
  const { data: tasks } = await supabase.from("taches").select("id, titre, statut, priorite, deadline").eq("internal_project_id", id).order("created_at", { ascending: false });
  return <main className="p-6 text-white md:p-10">
    <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><Link href="/projets-internes" className="text-sm text-zinc-400 hover:text-white">← Projets internes</Link><div className="flex flex-wrap gap-3"><Link href={`/taches/nouveau?internal_project_id=${id}`} className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-200">+ Créer une tâche</Link><Link href={`/projets-internes/${id}/modifier`} className="rounded-xl bg-white px-5 py-3 font-medium text-black">Modifier la fiche</Link></div></div>
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8"><div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">{project.categorie || "Projet interne"}</span><span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">{project.statut}</span><span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">{project.priorite}</span></div><h1 className="mt-6 text-4xl font-bold md:text-6xl">{project.titre}</h1><p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-300">{project.objectif || "Objectif à définir."}</p><div className="mt-8 grid gap-4 md:grid-cols-3"><Info label="Responsable" value={project.owner?.nom || project.owner?.full_name || "Non attribué"} /><Info label="Début" value={date(project.date_debut)} /><Info label="Échéance" value={date(project.deadline)} /></div></section>
    <div className="mt-8 grid gap-6 xl:grid-cols-2"><Panel title="Contexte et base de travail" value={project.contexte} /><Panel title="Consignes" value={project.consignes} /><Panel title="Décisions et arbitrages" value={project.decisions} /><Panel title="Ressources et liens" value={project.ressources} /></div>
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">Exécution</p><h2 className="mt-2 text-2xl font-bold">Tâches liées</h2></div><span className="rounded-full bg-black px-3 py-1 text-sm text-zinc-400">{tasks?.length || 0}</span></div><div className="mt-5 space-y-3">{!tasks?.length ? <p className="text-sm text-zinc-500">Aucune tâche liée. La fiche peut rester une base de travail sans tâche.</p> : tasks.map((task) => <Link key={task.id} href={`/taches/${task.id}`} className="grid gap-3 rounded-2xl border border-zinc-800 bg-black p-4 hover:border-zinc-600 md:grid-cols-[1fr_130px_130px]"><span className="font-medium">{task.titre}</span><span className="text-sm text-zinc-400">{task.statut}</span><span className="text-sm text-zinc-500 md:text-right">{task.deadline || "Sans échéance"}</span></Link>)}</div></section>
  </main>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-black p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
function Panel({ title, value }: { title: string; value: string | null }) { return <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">{value || "Aucune information renseignée."}</p></section>; }

