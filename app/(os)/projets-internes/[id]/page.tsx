import Link from "next/link";
import InternalProjectWorkspace from "@/components/InternalProjectWorkspace";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR];
function date(value: string | null) { return value ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Non définie"; }

export default async function InternalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(allowed); const { id } = await params; const supabase = await createAuthenticatedSupabaseClient();
  const { data: project, error } = await supabase.from("internal_projects").select("*, owner:profiles!internal_projects_owner_id_fkey(id, nom, full_name)").eq("id", id).single();
  if (error || !project) return <main className="p-10 text-white"><p className="text-red-400">Projet interne introuvable.</p></main>;
  const [{ data: tasks }, { data: milestones }, { data: resources }, { data: updates }, { data: members }, { data: profiles }] = await Promise.all([
    supabase.from("taches").select("id, titre, statut, priorite, deadline").eq("internal_project_id", id).order("created_at", { ascending: false }),
    supabase.from("internal_project_milestones").select("*").eq("project_id", id).order("deadline", { ascending: true }),
    supabase.from("internal_project_resources").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("internal_project_updates").select("*, author:profiles!internal_project_updates_author_id_fkey(nom, full_name)").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("internal_project_members").select("*, profile:profiles!internal_project_members_user_id_fkey(id, nom, full_name, avatar_url)").eq("project_id", id),
    supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin","admin","artistic_director","manager","prestataire"]).order("nom"),
  ]);
  return <main className="p-6 text-white md:p-10">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><Link href="/projets-internes" className="text-sm text-zinc-400 hover:text-white">← Projets internes</Link><div className="flex flex-wrap gap-3"><Link href={`/taches/nouveau?internal_project_id=${id}`} className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-200">+ Créer une tâche</Link><Link href={`/projets-internes/${id}/modifier`} className="rounded-xl bg-white px-5 py-3 font-medium text-black">Modifier le cadrage</Link></div></div>
    <header className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8"><div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">{project.pole || "Direction"} · {project.categorie || "Non classé"}</span><span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">{project.statut}</span><span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-300">Priorité {project.priorite}</span></div><h1 className="mt-6 text-4xl font-bold md:text-6xl">{project.titre}</h1><p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-300">{project.objectif || "Objectif à définir."}</p><div className="mt-8 grid gap-4 md:grid-cols-3"><Info label="Responsable" value={project.owner?.nom || project.owner?.full_name || "Non attribué"} /><Info label="Début" value={date(project.date_debut)} /><Info label="Échéance" value={date(project.deadline)} /></div></header>
    <InternalProjectWorkspace project={project} tasks={tasks || []} milestones={milestones || []} resources={resources || []} updates={updates || []} members={members || []} profiles={profiles || []} />
  </main>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-black p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 font-semibold">{value}</p></div>; }
