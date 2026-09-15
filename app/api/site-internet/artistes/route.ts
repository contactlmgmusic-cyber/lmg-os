import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

async function adminClient() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === ROLES.SUPER_ADMIN || profile?.role === ROLES.ADMIN ? supabase : null;
}

export async function GET() {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const { data, error } = await supabase.from("artistes").select("id, nom, slug, style, photo_url, is_public, featured, display_order").order("display_order").order("nom");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artists: data || [] });
}

export async function PATCH(request: Request) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Artiste invalide." }, { status: 400 });
  const patch = {
    ...(typeof body.is_public === "boolean" ? { is_public: body.is_public } : {}),
    ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
    ...(Number.isFinite(body.display_order) ? { display_order: Math.max(0, Math.round(body.display_order)) } : {}),
  };
  if (patch.is_public === false) Object.assign(patch, { featured: false });
  if (patch.featured === true) Object.assign(patch, { is_public: true });
  const { error } = await supabase.from("artistes").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ patch });
}

