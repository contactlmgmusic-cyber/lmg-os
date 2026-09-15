import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { isUserRole, ROLES } from "@/lib/roles";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (actor?.role !== ROLES.SUPER_ADMIN && actor?.role !== ROLES.ADMIN) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" && isUserRole(body.role) ? body.role : null;
  const artistId = typeof body?.artistId === "string" && body.artistId ? body.artistId : null;
  if (!name || !role) return NextResponse.json({ error: "Nom ou rôle invalide." }, { status: 400 });
  const { data: target } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  if (!target) return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  if (user.id === id && role !== target.role) return NextResponse.json({ error: "Tu ne peux pas modifier ton propre rôle." }, { status: 400 });
  if ((target.role === ROLES.SUPER_ADMIN || role === ROLES.SUPER_ADMIN) && actor.role !== ROLES.SUPER_ADMIN) return NextResponse.json({ error: "Seul un Super Admin peut modifier ce niveau d’accès." }, { status: 403 });
  if (target.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", ROLES.SUPER_ADMIN);
    if ((count || 0) <= 1) return NextResponse.json({ error: "Le dernier Super Admin doit être conservé." }, { status: 400 });
  }
  const { error } = await supabase.from("profiles").update({ nom: name, role, artiste_id: role === ROLES.ARTISTE ? artistId : null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

