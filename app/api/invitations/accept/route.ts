import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/service-supabase.server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token) || !name || name.length > 150 || password.length < 10 || password.length > 256) return NextResponse.json({ error: "Informations invalides ou mot de passe trop court." }, { status: 400 });
  const reference = randomUUID(), claim = randomUUID();
  let admin: ReturnType<typeof createServiceSupabaseClient>;
  try { admin = createServiceSupabaseClient(); } catch { return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 }); }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: invitations, error: claimError } = await admin.rpc("claim_lmg_invitation", { invitation_hash: tokenHash, claim });
  if (claimError) { console.error("Invitation claim failed", reference, claimError.code); return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 }); }
  const invitation = invitations?.[0];
  if (!invitation) return NextResponse.json({ error: "Ce lien est invalide, expiré ou déjà en cours d’utilisation." }, { status: 410 });
  const release = async () => {
    const { error } = await admin.from("invitations").update({ claim_id: null, claimed_at: null }).eq("id", invitation.id).eq("claim_id", claim).eq("status", "pending");
    if (error) console.error("Invitation release failed", reference, error.code);
  };
  const { data, error } = await admin.auth.admin.createUser({ email: invitation.email, password, email_confirm: true, user_metadata: { nom: name, role: invitation.role } });
  if (error || !data.user) {
    await release();
    return NextResponse.json({ error: "Création du compte impossible. Contactez votre administrateur." }, { status: 400 });
  }
  const userId = data.user.id;
  const { error: completionError } = await admin.rpc("complete_lmg_invitation", { invitation_id: invitation.id, claim, account_id: userId, account_name: name });
  if (completionError) {
    // Check an ambiguous response before compensating an operation that might have committed.
    const { data: outcome, error: readError } = await admin.from("invitations").select("status, accepted_user_id").eq("id", invitation.id).single();
    if (!readError && outcome?.status === "accepted" && outcome.accepted_user_id === userId) return NextResponse.json({ success: true });
    console.error("Invitation completion failed", reference, completionError.code);
    if (!readError && outcome?.status === "pending") {
      const { error: deletionError } = await admin.auth.admin.deleteUser(userId);
      if (!deletionError) await release();
      else console.error("Invitation compensation failed", reference, deletionError.code);
    }
    return NextResponse.json({ error: "Création interrompue. Contactez votre administrateur.", reference }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
