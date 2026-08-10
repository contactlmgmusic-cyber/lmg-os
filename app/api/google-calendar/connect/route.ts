import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createGoogleCalendarOAuthClient,
  createSignedGoogleOAuthState,
  GOOGLE_CALENDAR_SCOPES,
} from "@/lib/google-calendar.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Session manquante." },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    const origin = new URL(request.url).origin;
    const redirectUri =
      `${origin}/api/google-calendar/callback`;

    const oauthClient =
      createGoogleCalendarOAuthClient(redirectUri);

    const state =
      createSignedGoogleOAuthState(user.id);

    const authorizationUrl =
      oauthClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: true,
        scope: GOOGLE_CALENDAR_SCOPES,
        state,
      });

    return NextResponse.json({
      authorizationUrl,
    });
  } catch (error) {
    console.error(
      "Erreur connexion Google Calendar :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de démarrer la connexion Google Calendar.",
      },
      { status: 500 }
    );
  }
}