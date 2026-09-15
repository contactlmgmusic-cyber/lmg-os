import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token || !name || password.length < 10) return NextResponse.json({ error: "Informations invalides ou mot de passe trop court." }, { status: 400 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false, autoRefreshToken: false } });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: invitation } = await admin.from("invitations").select("id, email, role, expires_at").eq("token_hash", tokenHash).eq("status", "pending").maybeSingle();
  if (!invitation || !invitation.expires_at || new Date(invitation.expires_at) <= new Date()) return NextResponse.json({ error: "Ce lien est invalide ou expiré." }, { status: 410 });

  const { data, error } = await admin.auth.admin.createUser({ email: invitation.email, password, email_confirm: true, user_metadata: { nom: name, role: invitation.role } });
  if (error || !data.user) return NextResponse.json({ error: error?.message || "Création du compte impossible." }, { status: 400 });
  await admin.from("profiles").upsert({ id: data.user.id, email: invitation.email, nom: name, role: invitation.role }, { onConflict: "id" });
  await admin.from("invitations").update({ status: "accepted", accepted_at: new Date().toISOString(), token_hash: null }).eq("id", invitation.id).eq("status", "pending");
  return NextResponse.json({ success: true });
}

