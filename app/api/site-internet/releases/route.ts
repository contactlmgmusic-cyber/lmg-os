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
  const { data, error } = await supabase.from("projets").select("id, titre, slug, type, date_sortie, cover_url, hero_image_url, is_public, featured, show_in_carousel, display_order, artistes(nom)").order("display_order").order("date_sortie", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ releases: data || [] });
}

export async function PATCH(request: Request) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Release invalide." }, { status: 400 });
  const patch = {
    ...(typeof body.is_public === "boolean" ? { is_public: body.is_public } : {}),
    ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
    ...(typeof body.show_in_carousel === "boolean" ? { show_in_carousel: body.show_in_carousel } : {}),
    ...(Number.isFinite(body.display_order) ? { display_order: Math.max(0, Math.round(body.display_order)) } : {}),
  };
  if (patch.show_in_carousel === true) Object.assign(patch, { is_public: true });
  if (patch.is_public === false) Object.assign(patch, { show_in_carousel: false });
  const { error } = await supabase.from("projets").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ patch });
}

