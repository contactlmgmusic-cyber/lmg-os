import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCentralGmail } from "@/lib/google-gmail-central.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ScheduledEmail = {
  id: string;
  created_by: string;
  recipient_email: string;
  subject: string;
  message: string;
  entity_type:
    | "media"
    | "influenceur"
    | "partenaire"
    | "prospect";
  entity_id: string;
  scheduled_for: string;
  attempts: number;
};

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

function isCronAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  return (
    authorization ===
    `Bearer ${cronSecret}`
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
    const supabaseAdmin =
      createSupabaseAdmin();

    const now =
      new Date().toISOString();

      const processingTimeout =
  new Date(
    Date.now() -
      3 * 60 * 60 * 1000
  ).toISOString();

const {
  error: recoverableError,
} = await supabaseAdmin
  .from("crm_scheduled_emails")
  .update({
    status: "pending",
    error_message:
      "Traitement interrompu. Nouvelle tentative automatique.",
    updated_at: now,
  })
  .eq("status", "processing")
  .lt("updated_at", processingTimeout)
  .lt("attempts", 3);

if (recoverableError) {
  throw new Error(
    `Impossible de récupérer les relances bloquées : ${recoverableError.message}`
  );
}

const {
  error: exhaustedError,
} = await supabaseAdmin
  .from("crm_scheduled_emails")
  .update({
    status: "failed",
    error_message:
      "Échec définitif après 3 tentatives interrompues.",
    updated_at: now,
  })
  .eq("status", "processing")
  .lt("updated_at", processingTimeout)
  .gte("attempts", 3);

if (exhaustedError) {
  throw new Error(
    `Impossible de clôturer les relances bloquées : ${exhaustedError.message}`
  );
}

    const {
      data: scheduledEmails,
      error: scheduledError,
    } = await supabaseAdmin
      .from("crm_scheduled_emails")
      .select(
        `
          id,
          created_by,
          recipient_email,
          subject,
          message,
          entity_type,
          entity_id,
          scheduled_for,
          attempts
        `
      )
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", {
        ascending: true,
      })
      .limit(25);

    if (scheduledError) {
      throw new Error(
        `Erreur Supabase : ${scheduledError.message}`
      );
    }

    const emails =
      (scheduledEmails ||
        []) as ScheduledEmail[];

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    const results: Array<{
      id: string;
      status:
        | "sent"
        | "failed"
        | "skipped";
    }> = [];

    for (const email of emails) {
      const {
        data: lockedEmail,
        error: lockError,
      } = await supabaseAdmin
        .from(
          "crm_scheduled_emails"
        )
        .update({
          status: "processing",
          attempts:
            Number(
              email.attempts || 0
            ) + 1,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", email.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (
        lockError ||
        !lockedEmail
      ) {
        skippedCount += 1;

        results.push({
          id: email.id,
          status: "skipped",
        });

        continue;
      }

      try {
        const gmailResult =
          await sendCentralGmail({
            origin:
              request.nextUrl.origin,
            to: email.recipient_email,
            subject: email.subject,
            message: email.message,
          });

        const sentAt =
          new Date().toISOString();

        const {
          error: updateError,
        } = await supabaseAdmin
          .from(
            "crm_scheduled_emails"
          )
          .update({
            status: "sent",
            gmail_message_id:
              gmailResult.gmailMessageId,
            gmail_thread_id:
              gmailResult.gmailThreadId,
            error_message: null,
            sent_at: sentAt,
            updated_at: sentAt,
          })
          .eq("id", email.id);

        if (updateError) {
          console.error(
            "E-mail envoyé mais statut non mis à jour :",
            email.id,
            updateError
          );
        }

        const {
          error: logError,
        } = await supabaseAdmin
          .from("crm_email_logs")
          .insert({
            sent_by:
              email.created_by,
            recipient_email:
              email.recipient_email,
            subject: email.subject,
            message: email.message,
            entity_type:
              email.entity_type,
            entity_id:
              email.entity_id,
            gmail_message_id:
  gmailResult.gmailMessageId,
gmail_thread_id:
  gmailResult.gmailThreadId,
rfc_message_id:
  gmailResult.rfcMessageId,
status: "sent",
            error_message: null,
            sent_at: sentAt,
          });

        if (logError) {
          console.error(
            "Erreur historique Gmail :",
            email.id,
            logError
          );
        }

        sentCount += 1;

        results.push({
          id: email.id,
          status: "sent",
        });
      } catch (sendError) {
        const errorMessage =
          sendError instanceof Error
            ? sendError.message
            : "Erreur inconnue pendant l’envoi.";

        const failedAt =
  new Date().toISOString();

const attemptNumber =
  Number(email.attempts || 0) + 1;

const shouldRetry =
  attemptNumber < 3;

const {
  error: failedUpdateError,
} = await supabaseAdmin
  .from(
    "crm_scheduled_emails"
  )
  .update({
    status: shouldRetry
      ? "pending"
      : "failed",
    error_message:
      errorMessage,
    updated_at: failedAt,
  })
  .eq("id", email.id)
  .eq("status", "processing");

        if (failedUpdateError) {
          console.error(
            "Erreur mise à jour de la relance échouée :",
            email.id,
            failedUpdateError
          );
        }

        const {
          error: failedLogError,
        } = await supabaseAdmin
          .from("crm_email_logs")
          .insert({
            sent_by:
              email.created_by,
            recipient_email:
              email.recipient_email,
            subject: email.subject,
            message: email.message,
            entity_type:
              email.entity_type,
            entity_id:
              email.entity_id,
            gmail_message_id: null,
            gmail_thread_id: null,
            status: "failed",
            error_message:
              errorMessage,
            sent_at: failedAt,
          });

        if (failedLogError) {
          console.error(
            "Erreur historique de l’échec Gmail :",
            email.id,
            failedLogError
          );
        }

        failedCount += 1;

        results.push({
          id: email.id,
          status: "failed",
        });

        console.error(
          "Échec de la relance Gmail :",
          email.id,
          errorMessage
        );
      }
    }

    return NextResponse.json({
      success: true,
      processed: emails.length,
      sent: sentCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    });
  } catch (error) {
    console.error(
      "Erreur cron relances Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de traiter les relances Gmail.",
      },
      {
        status: 500,
      }
    );
  }
}