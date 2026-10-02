import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

const ALLOWED_ROLES = new Set([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
]);

async function getAuthorizedClient() {
  const supabase = await createAuthenticatedSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profils")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile?.role ||
    !ALLOWED_ROLES.has(profile.role)
  ) {
    return {
      error: NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      ),
    };
  }

  return { supabase };
}

export async function GET() {
  const auth = await getAuthorizedClient();

  if ("error" in auth) {
    return auth.error;
  }

  const { data, error } = await auth.supabase
    .from("site_settings")
    .select("*")
    .eq("id", "lmg_music")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const auth = await getAuthorizedClient();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await request.json();

  const update = {
    maintenance_enabled:
      body.maintenance_enabled === true,
    maintenance_title_fr:
      String(body.maintenance_title_fr || "").trim() ||
      "Site en maintenance",
    maintenance_title_en:
      String(body.maintenance_title_en || "").trim() ||
      "Website under maintenance",
    maintenance_message_fr:
      String(body.maintenance_message_fr || "").trim() ||
      "Nous travaillons actuellement sur LMG Music. Revenez très bientôt.",
    maintenance_message_en:
      String(body.maintenance_message_en || "").trim() ||
      "We are currently working on LMG Music. Please check back soon.",
  };

  const { data, error } = await auth.supabase
    .from("site_settings")
    .update(update)
    .eq("id", "lmg_music")
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
