import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncGoogleCalendarForUser } from "@/lib/google-calendar-sync.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401 }
    );
  }

  try {
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

    const { data: connections, error: connectionsError } =
      await supabaseAdmin
        .from("google_calendar_connections")
        .select("user_id");

    if (connectionsError) {
      throw connectionsError;
    }

    const origin = new URL(request.url).origin;
    const results = [];

    for (const connection of connections || []) {
      try {
        const result = await syncGoogleCalendarForUser(
          connection.user_id,
          origin
        );

        results.push({
          userId: connection.user_id,
          success: true,
          ...result,
        });
      } catch (error) {
        console.error(
          `Échec synchronisation Google pour ${connection.user_id} :`,
          error
        );

        results.push({
          userId: connection.user_id,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erreur inconnue",
        });
      }
    }

    const hasErrors = results.some((result) => !result.success);

    return NextResponse.json(
      {
        success: !hasErrors,
        synchronizedAccounts: results.length,
        results,
      },
      {
        status: hasErrors ? 500 : 200,
      }
    );
  } catch (error) {
    console.error("Erreur Cron Google Calendar :", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Le Cron Google Calendar a échoué.",
      },
      { status: 500 }
    );
  }
}