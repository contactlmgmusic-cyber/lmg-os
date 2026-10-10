import NewTaskForm from "@/components/NewTaskForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MobileNewTaskPage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: profiles }, { data: projets }, { data: internalProjects }] = await Promise.all([
    supabase.from("profiles").select("id, nom").order("nom"),
    supabase.from("projets").select("id, titre, artiste_id").order("titre"),
    supabase.from("internal_projects").select("id, titre").not("statut", "in", '("Terminé","Archivé")').order("titre"),
  ]);
  return <div className="px-5 py-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Action rapide</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Nouvelle tâche</h1><p className="mt-2 text-sm text-zinc-500">Assigne une action à une personne ou un projet.</p><div className="mt-6"><NewTaskForm profiles={(profiles || []).map(({ id, nom }: any) => ({ id, nom }))} projets={projets || []} internalProjects={internalProjects || []} successPath="/mobile/taches" /></div><span className="sr-only">{profile.role}</span></div>;
}
