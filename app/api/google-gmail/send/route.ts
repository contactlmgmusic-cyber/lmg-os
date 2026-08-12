import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { sendCentralGmail } from "@/lib/google-gmail-central.server";
import { ROLES } from "@/lib/roles";
import {
  canAccessCrmEmailEntity,
} from "@/lib/crm-email-access.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENTITY_TYPES = [
  "media",
  "influenceur",
  "partenaire",
  "prospect",
] as const;

type EntityType =
  (typeof ENTITY_TYPES)[number];

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

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function containsHeaderInjection(
  value: string
) {
  return /[\r\n]/.test(value);
}

export async function POST(
  request: NextRequest
) {
  let authenticatedUserId:
    | string
    | null = null;

  let logRecipient = "";
  let logSubject = "";
  let logMessage = "";

  let logEntityType:
    | EntityType
    | null = null;

  let logEntityId:
    | string
    | null = null;

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
    } =
      await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Authentification requise.",
        },
        {
          status: 401,
        }
      );
    }

    authenticatedUserId = user.id;

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const allowedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    if (
      !profile ||
      !allowedRoles.includes(
        profile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas l’autorisation d’envoyer des e-mails.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const to = String(
      body.to || ""
    ).trim();

    const subject = String(
      body.subject || ""
    ).trim();

    const message = String(
      body.message || ""
    ).trim();

    const requestedEntityType =
      body.entityType
        ? String(
            body.entityType
          )
        : null;

    const requestedEntityId =
      body.entityId
        ? String(body.entityId)
        : null;

    logRecipient = to;
    logSubject = subject;
    logMessage = message;

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        to
      );

    if (
  !validEmail ||
  !subject ||
  !message ||
  containsHeaderInjection(to) ||
  containsHeaderInjection(subject)
) {
      return NextResponse.json(
        {
          error:
            "Destinataire, objet ou message invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      subject.length > 200 ||
      message.length > 50000
    ) {
      return NextResponse.json(
        {
          error:
            "Le contenu de l’e-mail est trop long.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      requestedEntityType ||
      requestedEntityId
    ) {
      const validEntityType =
        requestedEntityType &&
        ENTITY_TYPES.includes(
          requestedEntityType as EntityType
        );

      const validEntityId =
        requestedEntityId &&
        validUuid(
          requestedEntityId
        );

      if (
        !validEntityType ||
        !validEntityId
      ) {
        return NextResponse.json(
          {
            error:
              "Contexte CRM invalide.",
          },
          {
            status: 400,
          }
        );
      }

      logEntityType =
        requestedEntityType as EntityType;

      logEntityId =
        requestedEntityId;

        const canAccess =
  await canAccessCrmEmailEntity({
    supabaseAdmin,
    userId: user.id,
    role: profile.role,
    entityType:
      logEntityType,
    entityId:
      logEntityId,
  });

if (!canAccess) {
  return NextResponse.json(
    {
      error:
        "Tu n’as pas accès à cette fiche CRM.",
    },
    { status: 403 }
  );
}
    }

    const gmailResult =
      await sendCentralGmail({
        origin:
          request.nextUrl.origin,
        to,
        subject,
        message,
      });

    const sentAt =
      new Date().toISOString();

    const { error: logError } =
      await supabaseAdmin
        .from("crm_email_logs")
        .insert({
          sent_by: user.id,
          recipient_email: to,
          subject,
          message,
          entity_type:
            logEntityType,
          entity_id:
            logEntityId,
          gmail_message_id:
            gmailResult.gmailMessageId,
          gmail_thread_id:
            gmailResult.gmailThreadId,
          status: "sent",
          error_message: null,
          sent_at: sentAt,
        });

    if (logError) {
      console.error(
        "Erreur historique e-mail :",
        logError
      );
    }

    return NextResponse.json({
      success: true,
      messageId:
        gmailResult.gmailMessageId,
      threadId:
        gmailResult.gmailThreadId,
      historySaved: !logError,
    });
  } catch (error) {
    console.error(
      "Erreur envoi Gmail :",
      error
    );

    if (
      authenticatedUserId &&
      logRecipient &&
      logSubject &&
      logMessage
    ) {
      try {
        const supabaseAdmin =
          createSupabaseAdmin();

        await supabaseAdmin
          .from("crm_email_logs")
          .insert({
            sent_by:
              authenticatedUserId,
            recipient_email:
              logRecipient,
            subject: logSubject,
            message: logMessage,
            entity_type:
              logEntityType,
            entity_id:
              logEntityId,
            gmail_message_id: null,
            gmail_thread_id: null,
            status: "failed",
            error_message:
              error instanceof Error
                ? error.message
                : "Erreur inconnue",
            sent_at:
              new Date().toISOString(),
          });
      } catch (
        logFailureError
      ) {
        console.error(
          "Impossible d’enregistrer l’échec de l’e-mail :",
          logFailureError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d’envoyer l’e-mail.",
      },
      {
        status: 500,
      }
    );
  }
}