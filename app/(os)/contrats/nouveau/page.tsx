import ContractCreationForm from "@/components/ContractCreationForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NouveauContratPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: artists, error: artistError }, { data: projects, error: projectError }] = await Promise.all([
    supabase.from("artistes").select("id, nom").order("nom"),
    supabase.from("projets").select("id, titre, artiste_id").order("titre"),
  ]);
  return <ContractCreationForm artists={artists || []} projects={projects || []} loadError={artistError?.message || projectError?.message || ""} />;
}
