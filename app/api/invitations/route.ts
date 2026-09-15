import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES, isUserRole } from "@/lib/roles";

export const runtime = "nodejs";

const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTE, ROLES.PRESTATAIRE];

async function adminContext() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== ROLES.SUPER_ADMIN && profile?.role !== ROLES.ADMIN) return null;
  return { user };
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET() {
  if (!(await adminContext())) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const { data, error } = await serviceClient().from("invitations").select("id, email, role, status, created_at, expires_at, accepted_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitations: data || [] });
}

export async function POST(request: Request) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body?.role === "string" && isUserRole(body.role) ? body.role : "";
  if (!email || !role || !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    return NextResponse.json({ error: "E-mail ou rôle invalide." }, { status: 400 });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const admin = serviceClient();
  await admin.from("invitations").update({ status: "expired" }).eq("email", email).eq("status", "pending");
  const { error } = await admin.from("invitations").insert({ email, role, invited_by: context.user.id, status: "pending", token_hash: tokenHash, expires_at: expiresAt });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token, expiresAt }, { status: 201 });
}

