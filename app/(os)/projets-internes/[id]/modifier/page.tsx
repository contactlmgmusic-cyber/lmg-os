import InternalProjectForm from "@/components/InternalProjectForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function EditInternalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER]);
  const { id } = await params; const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: project }, { data: profiles }] = await Promise.all([supabase.from("internal_projects").select("*").eq("id", id).single(), supabase.from("profiles").select("id, nom, full_name").in("role", ["super_admin","admin","artistic_director","manager","prestataire"]).order("nom")]);
  if (!project) return <main className="p-10 text-white">Projet interne introuvable.</main>;
  return <main className="p-6 text-white md:p-10"><div className="mb-10"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">Mise à jour</p><h1 className="text-4xl font-bold md:text-5xl">Modifier le projet interne</h1></div><InternalProjectForm profiles={profiles || []} project={project} /></main>;
}
