import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  createGoogleCalendarOAuthClient,
  GOOGLE_CALENDAR_SCOPES,
} from "@/lib/google-calendar.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
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
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const { data: profile } = await supabase
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
    createGoogleCalendarOAuthClient(redirectUri);

  const state = randomUUID();

  const authorizationUrl =
    oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: true,
      scope: GOOGLE_CALENDAR_SCOPES,
      state,
    });

  const response =
    NextResponse.redirect(authorizationUrl);

  response.cookies.set(
    "google_calendar_oauth_state",
    state,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    }
  );

  return response;
}