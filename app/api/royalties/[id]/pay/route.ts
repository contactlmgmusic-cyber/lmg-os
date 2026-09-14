import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROLES } from "@/lib/roles";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { getAll: () => request.cookies.getAll(), setAll() {} } }
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (profileError || (profile?.role !== ROLES.SUPER_ADMIN && profile?.role !== ROLES.ADMIN)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const date = body.date_paiement;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const fields = ["methode_paiement", "reference_paiement", "notes_paiement"] as const;
  for (const field of fields) {
    if (body[field] !== null && body[field] !== undefined &&
        (typeof body[field] !== "string" || body[field].length > 2000)) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
  }
  const { data, error } = await supabase.from("royalties").update({
    statut: "Payé",
    date_paiement: date,
    methode_paiement: body.methode_paiement ?? null,
    reference_paiement: body.reference_paiement ?? null,
    notes_paiement: body.notes_paiement ?? null,
  }).eq("id", id).neq("statut", "Payé").select("id, nom, montant_du").maybeSingle();
  if (error) return NextResponse.json({ error: "Paiement impossible." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Royalty introuvable ou déjà payée." }, { status: 409 });
  await supabase.from("activity_logs").insert({
    type: "Royalties",
    titre: "Royalty payée",
    description: `${data.nom} • ${Number(data.montant_du || 0).toFixed(2)} €`,
  });
  return NextResponse.json({ ok: true });
}
