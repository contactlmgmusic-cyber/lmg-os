import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  createSignedGoogleOAuthState,
} from "@/lib/google-calendar.server";
import {
  getGoogleGmailAuthUrl,
} from "@/lib/google-gmail.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase indisponible."
    );
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

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseAuth =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentification requise.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const allowed =
      profile?.role ===
        ROLES.SUPER_ADMIN ||
      profile?.role === ROLES.ADMIN;

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Accès réservé aux administrateurs.",
        },
        { status: 403 }
      );
    }

    const state =
      createSignedGoogleOAuthState(
        user.id
      );

    const url = getGoogleGmailAuthUrl({
      origin: request.nextUrl.origin,
      state,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error(
      "Erreur connexion Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de démarrer la connexion Gmail.",
      },
      { status: 500 }
    );
  }
}