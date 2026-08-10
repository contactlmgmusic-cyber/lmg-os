import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createGoogleCalendarOAuthClient } from "@/lib/google-calendar.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function redirectWithStatus(
  request: NextRequest,
  status: string
) {
  const response = NextResponse.redirect(
    new URL(
      `/calendrier/global?google=${status}`,
      request.url
    )
  );

  response.cookies.delete(
    "google_calendar_oauth_state"
  );

  return response;
}

export async function GET(request: NextRequest) {
  try {
    const code =
      request.nextUrl.searchParams.get("code");

    const state =
      request.nextUrl.searchParams.get("state");

    const oauthError =
      request.nextUrl.searchParams.get("error");

    const cookieStore = await cookies();

    const storedState = cookieStore.get(
      "google_calendar_oauth_state"
    )?.value;

    if (
      oauthError ||
      !code ||
      !state ||
      !storedState ||
      state !== storedState
    ) {
      return redirectWithStatus(
        request,
        "connection-error"
      );
    }

    const supabaseAuth = createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL as string,
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const { data: profile } =
      await supabaseAuth
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    const origin = new URL(request.url).origin;

    const redirectUri =
      `${origin}/api/google-calendar/callback`;

    const oauthClient =
      createGoogleCalendarOAuthClient(
        redirectUri
      );

    const { tokens } =
      await oauthClient.getToken(code);

    if (
      !tokens.access_token ||
      !tokens.refresh_token
    ) {
      return redirectWithStatus(
        request,
        "token-error"
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

    const { error: saveError } =
      await supabaseAdmin
        .from(
          "google_calendar_connections"
        )
        .upsert(
          {
            user_id: user.id,
            access_token:
              tokens.access_token,
            refresh_token:
              tokens.refresh_token,
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