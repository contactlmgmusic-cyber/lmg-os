import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncGoogleCalendarForUser } from "@/lib/google-calendar-sync.server";
import { ROLES } from "@/lib/roles";

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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const origin = new URL(request.url).origin;

    const result = await syncGoogleCalendarForUser(
      user.id,
      origin
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : JSON.stringify(error);

    console.error("Erreur synchronisation Google Calendar :", error);

    return NextResponse.json(
      {
        error:
          message && message !== "{}"
            ? message
            : "La synchronisation Google Calendar a échoué.",
      },
      { status: 500 }
    );
  }
}