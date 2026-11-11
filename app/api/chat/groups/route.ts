import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";

const GROUP_KINDS = ["staff", "artist", "direction", "custom"] as const;
const WRITE_MODES = ["all_members", "selected_members", "super_admin_only"] as const;

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function superAdminContext() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === ROLES.SUPER_ADMIN ? { user } : null;
}

function cleanBody(body: unknown) {
  const value = body as Record<string, unknown> | null;
  const name = typeof value?.name === "string" ? value.name.trim() : "";
  const description = typeof value?.description === "string" ? value.description.trim() : "";
  const groupKind = GROUP_KINDS.includes(value?.groupKind as (typeof GROUP_KINDS)[number])
    ? value?.groupKind as (typeof GROUP_KINDS)[number]
    : null;
  const writeMode = WRITE_MODES.includes(value?.writeMode as (typeof WRITE_MODES)[number])
    ? value?.writeMode as (typeof WRITE_MODES)[number]
    : null;
  const artisteId = typeof value?.artisteId === "string" && value.artisteId ? value.artisteId : null;
  const members = Array.isArray(value?.members)
    ? value.members.filter((member): member is { userId: string; canWrite: boolean } =>
        Boolean(member && typeof member.userId === "string" && typeof member.canWrite === "boolean")
      )
    : [];
  return { name, description, groupKind, writeMode, artisteId, members };
}

export async function GET() {
  if (!(await superAdminContext())) {
    return NextResponse.json({ error: "Accès réservé aux super admins." }, { status: 403 });
  }
  const admin = serviceClient();
  const [{ data: profiles, error: profilesError }, { data: artists, error: artistsError }] = await Promise.all([
    admin.from("profiles").select("id,nom,full_name,email,role,artiste_id").order("nom"),
    admin.from("artistes").select("id,nom,manager_id").order("nom"),
  ]);
  if (profilesError || artistsError) {
    return NextResponse.json(
      { error: profilesError?.message || artistsError?.message || "Annuaire indisponible." },
      { status: 500 }
    );
  }
  return NextResponse.json({ profiles: profiles || [], artists: artists || [] });
}

export async function POST(request: Request) {
  const context = await superAdminContext();
  if (!context) return NextResponse.json({ error: "Accès réservé aux super admins." }, { status: 403 });
  const body = cleanBody(await request.json().catch(() => null));
  if (!body.name || !body.groupKind || !body.writeMode || !body.members.length) {
    return NextResponse.json({ error: "Nom, type, droits ou membres manquants." }, { status: 400 });
  }
  if (body.groupKind === "artist" && !body.artisteId) {
    return NextResponse.json({ error: "L’artiste concerné est obligatoire." }, { status: 400 });
  }

  const admin = serviceClient();
  const ids = [...new Set(body.members.map((member) => member.userId))];
  const { data: profiles, error: profilesError } = await admin.from("profiles").select("id,role").in("id", ids);
  if (profilesError || (profiles || []).length !== ids.length) {
    return NextResponse.json({ error: "Un ou plusieurs membres sont invalides." }, { status: 400 });
  }
  const roles = [...new Set((profiles || []).map((profile) => profile.role))];
  const slugRoot = body.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "groupe";
  const slug = `${slugRoot}-${crypto.randomUUID().slice(0, 6)}`;
  const { data: channel, error: channelError } = await admin.from("chat_channels").insert({
    name: body.name,
    slug,
    description: body.description || null,
    type: body.groupKind === "artist" ? "artiste" : "general",
    group_kind: body.groupKind,
    artiste_id: body.groupKind === "artist" ? body.artisteId : null,
    projet_id: null,
    write_mode: body.writeMode,
    allowed_roles: roles,
    created_by: context.user.id,
  }).select("id,slug").single();
  if (channelError || !channel) {
    return NextResponse.json({ error: channelError?.message || "Création impossible." }, { status: 400 });
  }

  await admin.from("chat_channel_members").delete().eq("channel_id", channel.id);
  const { error: memberError } = await admin.from("chat_channel_members").insert(
    body.members.map((member) => ({ channel_id: channel.id, user_id: member.userId, can_write: member.canWrite }))
  );
  if (memberError) {
    await admin.from("chat_channels").delete().eq("id", channel.id);
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }
  return NextResponse.json({ channel }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await superAdminContext())) {
    return NextResponse.json({ error: "Accès réservé aux super admins." }, { status: 403 });
  }
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  const channelId = typeof raw?.channelId === "string" ? raw.channelId : "";
  const body = cleanBody(raw);
  if (!channelId || !body.name || !body.groupKind || !body.writeMode || !body.members.length) {
    return NextResponse.json({ error: "Configuration du groupe incomplète." }, { status: 400 });
  }

  const admin = serviceClient();
  const ids = [...new Set(body.members.map((member) => member.userId))];
  const { data: profiles, error: profilesError } = await admin.from("profiles").select("id,role").in("id", ids);
  if (profilesError || (profiles || []).length !== ids.length) {
    return NextResponse.json({ error: "Un ou plusieurs membres sont invalides." }, { status: 400 });
  }
  const roles = [...new Set((profiles || []).map((profile) => profile.role))];
  const { error: channelError } = await admin.from("chat_channels").update({
    name: body.name,
    description: body.description || null,
    type: body.groupKind === "artist" ? "artiste" : "general",
    group_kind: body.groupKind,
    artiste_id: body.groupKind === "artist" ? body.artisteId : null,
    projet_id: null,
    write_mode: body.writeMode,
    allowed_roles: roles,
  }).eq("id", channelId);
  if (channelError) return NextResponse.json({ error: channelError.message }, { status: 400 });

  const { error: clearError } = await admin.from("chat_channel_members").delete().eq("channel_id", channelId);
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 400 });
  const { error: memberError } = await admin.from("chat_channel_members").insert(
    body.members.map((member) => ({ channel_id: channelId, user_id: member.userId, can_write: member.canWrite }))
  );
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
