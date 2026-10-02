import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

async function authorize() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return createAuthenticatedSupabaseClient();
}

export async function GET() {
  try {
    const supabase = await authorize();

    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Maintenance GET authorization error:", error);

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await authorize();
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

    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Maintenance PATCH authorization error:", error);

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}
