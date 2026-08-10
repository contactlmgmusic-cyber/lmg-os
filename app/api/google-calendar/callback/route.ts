import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createGoogleCalendarOAuthClient,
  verifySignedGoogleOAuthState,
} from "@/lib/google-calendar.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function redirectWithStatus(
  request: NextRequest,
  status: string
) {
  return NextResponse.redirect(
    new URL(
      `/calendrier/global?google=${status}`,
      request.url
    )
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const code =
      request.nextUrl.searchParams.get("code");

    const state =
      request.nextUrl.searchParams.get("state");

    const oauthError =
      request.nextUrl.searchParams.get("error");

    if (oauthError || !code || !state) {
      return redirectWithStatus(
        request,
        "connection-error"
      );
    }

    const verifiedState =
      verifySignedGoogleOAuthState(state);

    if (!verifiedState) {
      return redirectWithStatus(
        request,
        "invalid-state"
      );
    }

    const supabaseAdmin = createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL as string,
      process.env
        .SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", verifiedState.userId)
        .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      return redirectWithStatus(
        request,
        "unauthorized"
      );
    }

    const origin =
      new URL(request.url).origin;

    const redirectUri =
      `${origin}/api/google-calendar/callback`;

    const oauthClient =
      createGoogleCalendarOAuthClient(
        redirectUri
      );

    const { tokens } =
      await oauthClient.getToken(code);

    const { data: existingConnection } =
      await supabaseAdmin
        .from(
          "google_calendar_connections"
        )
        .select("refresh_token")
        .eq(
          "user_id",
          verifiedState.userId
        )
        .maybeSingle();

    const refreshToken =
      tokens.refresh_token ||
      existingConnection?.refresh_token;

    if (
      !tokens.access_token ||
      !refreshToken
    ) {
      return redirectWithStatus(
        request,
        "token-error"
      );
    }

    const { error: saveError } =
      await supabaseAdmin
        .from(
          "google_calendar_connections"
        )
        .upsert(
          {
            user_id: verifiedState.userId,
            access_token:
              tokens.access_token,
            refresh_token: refreshToken,
            expiry_date:
              tokens.expiry_date || null,
            scope: tokens.scope || null,
            token_type:
              tokens.token_type || null,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

    if (saveError) {
      console.error(
        "Erreur sauvegarde Google Calendar :",
        saveError
      );

      return redirectWithStatus(
        request,
        "save-error"
      );
    }

    return redirectWithStatus(
      request,
      "connected"
    );
  } catch (error) {
    console.error(
      "Erreur callback Google Calendar :",
      error
    );

    return redirectWithStatus(
      request,
      "connection-error"
    );
  }
}