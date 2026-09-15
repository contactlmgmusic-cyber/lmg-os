import FinanceEditForm from "@/components/FinanceEditForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ModifierFinancePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const [financeResult, artistResult, projectResult, bookingResult] = await Promise.all([
    supabase.from("finances").select("id, titre, type, categorie, montant, statut, date_operation, artiste_id, projet_id, booking_id, notes").eq("id", id).single(),
    supabase.from("artistes").select("id, nom").order("nom"),
    supabase.from("projets").select("id, titre, artiste_id").order("titre"),
    supabase.from("bookings").select("id, evenement, artiste_id").order("evenement"),
  ]);
  if (financeResult.error || !financeResult.data) return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px] rounded-[26px] border border-red-500/20 bg-red-500/[0.06] p-7"><h1 className="text-3xl font-bold">Opération indisponible</h1><p className="mt-3 text-sm text-zinc-400">La transaction n’a pas pu être chargée.</p></div></main>;
  return <FinanceEditForm finance={financeResult.data} artists={artistResult.data || []} projects={projectResult.data || []} bookings={bookingResult.data || []} />;
}
