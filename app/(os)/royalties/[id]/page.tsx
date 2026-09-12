import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import RoyaltyDetailClient from "./RoyaltyDetailClient";

export const dynamic = "force-dynamic";

export default async function RoyaltyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
    ROLES.ARTISTE,
  ]);
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );

  let query = supabase.from("royalties").select(`
    id, projet_id, nom, role, email, pourcentage, revenu_total, montant_du,
    statut, date_paiement, methode_paiement, reference_paiement, notes_paiement,
    projets (id, titre)
  `).eq("id", id);

  if (profile.role === ROLES.ARTISTE) {
    const { data: { user } } = await supabase.auth.getUser();
    query = query.eq("email", user?.email || "__no_email__");
  }

  const { data: royalty, error } = await query.maybeSingle();
  if (error || !royalty) notFound();

  if (profile.role === ROLES.MANAGER) {
    if (!royalty.projet_id) notFound();
    const { data: project, error: projectError } = await supabase
      .from("projets")
      .select("artiste_id, artistes!inner(manager_id)")
      .eq("id", royalty.projet_id)
      .eq("artistes.manager_id", profile.id)
      .maybeSingle();
    if (projectError || !project) notFound();
  }

  return <RoyaltyDetailClient initialRoyalty={royalty} canPay={
    profile.role === ROLES.SUPER_ADMIN || profile.role === ROLES.ADMIN
  } />;
}
