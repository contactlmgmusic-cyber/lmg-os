import FinanceOperationForm from "@/components/FinanceOperationForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NouvelleFinancePage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: artists, error: artistError }, { data: projects, error: projectError }, { data: bookings, error: bookingError }] = await Promise.all([
    supabase.from("artistes").select("id, nom").order("nom"),
    supabase.from("projets").select("id, titre, artiste_id").order("titre"),
    supabase.from("bookings").select("id, evenement, artiste_id").order("evenement"),
  ]);
  return <FinanceOperationForm artists={artists || []} projects={projects || []} bookings={bookings || []} loadError={artistError?.message || projectError?.message || bookingError?.message || ""} />;
}
