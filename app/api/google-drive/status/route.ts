import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase indisponible.");
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const accessToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (
      !profile ||
      (
        profile.role !== ROLES.SUPER_ADMIN &&
        profile.role !== ROLES.ADMIN
      )
    ) {
      return NextResponse.json(
        { error: "Accès administrateur requis." },
        { status: 403 }
      );
    }

    const { data: connection, error } =
      await supabaseAdmin
        .from("google_drive_connections")
        .select(
          "google_email, root_folder_id, updated_at"
        )
        .eq("id", "lmg-central")
        .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      connected: Boolean(
        connection?.root_folder_id
      ),
      googleEmail:
        connection?.google_email || null,
      updatedAt:
        connection?.updated_at || null,
    });
  } catch (error) {
    console.error(
      "Erreur statut Google Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de vérifier la connexion Google Drive.",
      },
      { status: 500 }
    );
  }
}