import RoyaltyGenerator from "@/components/RoyaltyGenerator";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function GenererRoyaltiesPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: splits, error }, { data: existing }] = await Promise.all([
    supabase.from("splits").select("id, titre, statut, projet_id, projets(id, titre), split_participants(id, nom, role, email, pourcentage)").order("created_at", { ascending: false }),
    supabase.from("royalties").select("split_id"),
  ]);
  const generatedSplitIds = Array.from(new Set((existing || []).map((item: any) => item.split_id).filter(Boolean)));
  return <RoyaltyGenerator splits={(splits || []) as any[]} generatedSplitIds={generatedSplitIds} loadError={error?.message || ""} />;
}
