import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import InternalProjectsDirectory from "@/components/InternalProjectsDirectory";

export const dynamic = "force-dynamic";
const allowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER];

export default async function InternalProjectsPage() {
  await requireRole(allowed);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: projects, error } = await supabase.from("internal_projects").select("*, owner:profiles!internal_projects_owner_id_fkey(id, nom, full_name)").order("updated_at", { ascending: false });
  if (error) return <main className="p-10 text-white"><p className="text-red-400">Erreur : {error.message}</p></main>;
  const active = (projects || []).filter((p) => !["Terminé", "Archivé"].includes(p.statut)).length;
  const urgent = (projects || []).filter((p) => p.priorite === "Urgente" && p.statut !== "Terminé").length;
  return (
    <main className="p-6 text-white md:p-10">
      <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">Organisation LMG</p><h1 className="text-4xl font-bold md:text-5xl">Projets internes</h1><p className="mt-3 text-zinc-400">Centralisez les briefs, consignes, décisions et ressources de l’équipe.</p></div><Link href="/projets-internes/nouveau" className="rounded-xl bg-white px-5 py-3 font-medium text-black">+ Nouveau projet interne</Link></div>
      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3"><Kpi label="Projets actifs" value={active} /><Kpi label="Priorités urgentes" value={urgent} accent /><Kpi label="Total" value={(projects || []).length} /></section>
      {!projects?.length ? <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center"><p className="text-zinc-400">Aucun projet interne pour le moment.</p><Link href="/projets-internes/nouveau" className="mt-5 inline-block text-yellow-400">Créer le premier projet →</Link></div> : <InternalProjectsDirectory projects={projects as any} />}
    </main>
  );
}
function Kpi({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) { return <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"><p className="text-sm text-zinc-500">{label}</p><p className={`mt-3 text-4xl font-bold ${accent ? "text-red-400" : "text-white"}`}>{value}</p></div>; }
