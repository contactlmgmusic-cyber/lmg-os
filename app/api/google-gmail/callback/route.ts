import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifySignedGoogleOAuthState,
} from "@/lib/google-calendar.server";
import {
  createGoogleGmailApi,
  createGoogleGmailOAuthClient,
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

function redirectToAdmin(
  request: NextRequest,
  status: string
) {
  const url = new URL(
    "/admin",
    request.nextUrl.origin
  );

  url.searchParams.set(
    "googleGmail",
    status
  );

  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest
) {
  try {
    const code =
      request.nextUrl.searchParams.get(
        "code"
      );

    const state =
      request.nextUrl.searchParams.get(
        "state"
      );

    const oauthError =
      request.nextUrl.searchParams.get(
        "error"
      );

    if (oauthError) {
      return redirectToAdmin(
        request,
        "cancelled"
      );
    }

    if (!code || !state) {
      return redirectToAdmin(
        request,
        "invalid-callback"
      );
    }

    const verifiedState =
      verifySignedGoogleOAuthState(
        state
      );

    if (!verifiedState) {
      return redirectToAdmin(
        request,
        "invalid-state"
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq(
          "id",
          verifiedState.userId
        )
        .single();

    const allowed =
      profile?.role ===
        ROLES.SUPER_ADMIN ||
      profile?.role === ROLES.ADMIN;

    if (!allowed) {
      return redirectToAdmin(
        request,
        "forbidden"
      );
    }

    const oauth2Client =
      createGoogleGmailOAuthClient(
        request.nextUrl.origin
      );

    const { tokens } =
      await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const gmail =
      createGoogleGmailApi(
        oauth2Client
      );

    const gmailProfile =
      await gmail.users.getProfile({
        userId: "me",
      });

    const { data: existing } =
      await supabaseAdmin
        .from(
          "google_gmail_connections"
        )
        .select("refresh_token")
        .eq("id", "lmg-central")
        .maybeSingle();

    const refreshToken =
      tokens.refresh_token ||
      existing?.refresh_token;

    if (
      !tokens.access_token ||
      !refreshToken
    ) {
      return redirectToAdmin(
        request,
        "missing-token"
      );
    }

    const { error: saveError } =
      await supabaseAdmin
        .from(
          "google_gmail_connections"
        )
        .upsert(
          {
            id: "lmg-central",
            connected_by:
              verifiedState.userId,
            google_email:
              gmailProfile.data
                .emailAddress || null,
            access_token:
              tokens.access_token,
            refresh_token:
              refreshToken,
            token_expiry:
              tokens.expiry_date
                ? new Date(
                    tokens.expiry_date
                  ).toISOString()
                : null,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

    if (saveError) {
      console.error(
        "Erreur sauvegarde Gmail :",
        saveError
      );

      return redirectToAdmin(
        request,
        "save-error"
      );
    }

    return redirectToAdmin(
      request,
      "connected"
    );
  } catch (error) {
    console.error(
      "Erreur callback Gmail :",
      error
    );

    return redirectToAdmin(
      request,
      "connection-error"
    );
  }
}