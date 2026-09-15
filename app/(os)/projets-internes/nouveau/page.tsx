import InternalProjectForm from "@/components/InternalProjectForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function NewInternalProjectPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: profiles } = await supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin","admin","artistic_director","manager","prestataire"]).order("nom");
  return <main className="p-6 text-white md:p-10"><div className="mb-10"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">Nouveau workspace</p><h1 className="text-4xl font-bold md:text-5xl">Créer un projet interne</h1><p className="mt-3 text-zinc-400">Posez la base du projet avant de répartir les tâches.</p></div><InternalProjectForm profiles={profiles || []} /></main>;
}
