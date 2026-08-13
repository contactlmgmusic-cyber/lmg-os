import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";
import {
  canAccessCrmEmailEntity,
  type CrmEmailEntityType,
} from "@/lib/crm-email-access.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENTITY_TYPES = [
  "media",
  "influenceur",
  "partenaire",
  "prospect",
] as const;

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

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidEntityType(
  value: string
): value is CrmEmailEntityType {
  return ENTITY_TYPES.includes(
    value as CrmEmailEntityType
  );
}

export async function GET(
  request: NextRequest
) {
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

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const allowedRoles: string[] = [
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
          error: "Accès refusé.",
        },
        {
          status: 403,
        }
      );
    }

    const entityType =
      request.nextUrl.searchParams.get(
        "entityType"
      );

    const entityId =
      request.nextUrl.searchParams.get(
        "entityId"
      );

    if (
      !entityType ||
      !isValidEntityType(entityType) ||
      !entityId ||
      !isValidUuid(entityId)
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

    const canAccess =
      await canAccessCrmEmailEntity({
        supabaseAdmin,
        userId: user.id,
        role: profile.role,
        entityType,
        entityId,
      });

    if (!canAccess) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas accès à l’historique de cette fiche.",
        },
        {
          status: 403,
        }
      );
    }

    const [
      {
        data: emails,
        error: emailsError,
      },
      {
        data: replies,
        error: repliesError,
      },
    ] = await Promise.all([
      supabaseAdmin
        .from("crm_email_logs")
        .select(
          `
            id,
            recipient_email,
            subject,
            message,
            status,
            error_message,
            sent_by,
            sent_at,
            rfc_message_id
          `
        )
        .eq(
          "entity_type",
          entityType
        )
        .eq("entity_id", entityId)
        .order("sent_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("crm_email_replies")
        .select(
          `
            id,
            email_log_id,
            message_id,
            in_reply_to,
            sender_email,
            sender_name,
            recipient_email,
            subject,
            message_text,
            received_at
          `
        )
        .eq(
          "entity_type",
          entityType
        )
        .eq("entity_id", entityId)
        .order("received_at", {
          ascending: true,
        }),
    ]);

    if (emailsError) {
      throw emailsError;
    }

    if (repliesError) {
      throw repliesError;
    }

    const repliesByEmailLogId =
      (replies || []).reduce<
        Record<
          string,
          typeof replies
        >
      >((groups, reply) => {
        if (!reply.email_log_id) {
          return groups;
        }

        if (
          !groups[reply.email_log_id]
        ) {
          groups[reply.email_log_id] =
            [];
        }

        groups[
          reply.email_log_id
        ]?.push(reply);

        return groups;
      }, {});

    const emailsWithReplies =
      (emails || []).map(
        (email) => ({
          ...email,
          replies:
            repliesByEmailLogId[
              email.id
            ] || [],
        })
      );

    return NextResponse.json({
      emails: emailsWithReplies,
      replies: replies || [],
      repliesCount:
        replies?.length || 0,
    });
  } catch (error) {
    console.error(
      "Erreur historique Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger l’historique des e-mails.",
      },
      {
        status: 500,
      }
    );
  }
}