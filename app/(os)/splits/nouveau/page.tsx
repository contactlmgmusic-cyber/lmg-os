import SplitCreationForm from "@/components/SplitCreationForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NouveauSplitPage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: artists, error: artistError }, { data: projects, error: projectError }] = await Promise.all([
    profile.role === ROLES.MANAGER
      ? supabase.from("artistes").select("id, nom").eq("manager_id", profile.id).order("nom")
      : supabase.from("artistes").select("id, nom").order("nom"),
    supabase.from("projets").select("id, titre, artiste_id").order("titre"),
  ]);
  return <SplitCreationForm artists={artists || []} projects={projects || []} userId={profile.id} loadError={artistError?.message || projectError?.message || ""} />;
}
