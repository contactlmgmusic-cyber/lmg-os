import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createSignedGoogleOAuthState,
} from "@/lib/google-calendar.server";
import {
  getGoogleDriveAuthUrl,
} from "@/lib/google-drive.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
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

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil utilisateur introuvable." },
        { status: 403 }
      );
    }

    if (
      profile.role !== ROLES.SUPER_ADMIN &&
      profile.role !== ROLES.ADMIN
    ) {
      return NextResponse.json(
        {
          error:
            "Seuls les administrateurs peuvent connecter le Drive LMG.",
        },
        { status: 403 }
      );
    }

    const state =
      createSignedGoogleOAuthState(user.id);

    const url = getGoogleDriveAuthUrl({
      origin: request.nextUrl.origin,
      state,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error(
      "Erreur connexion Google Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de démarrer la connexion Google Drive.",
      },
      { status: 500 }
    );
  }
}