import {
  NextRequest,
  NextResponse,
} from "next/server";
import { syncOvhEmailReplies } from "@/lib/ovh-email-replies-sync.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isCronAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return (
    request.headers.get(
      "authorization"
    ) === `Bearer ${cronSecret}`
  );
}

export async function GET(
  request: NextRequest
) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          "Accès au cron refusé.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const result =
      await syncOvhEmailReplies();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Erreur synchronisation des réponses OVH :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les réponses reçues.",
      },
      {
        status: 500,
      }
    );
  }
}