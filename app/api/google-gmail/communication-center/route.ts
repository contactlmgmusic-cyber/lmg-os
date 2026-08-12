import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "all",
  "sent",
  "failed",
  "pending",
  "processing",
  "cancelled",
] as const;

const ALLOWED_ENTITY_TYPES = [
  "all",
  "media",
  "influenceur",
  "partenaire",
  "prospect",
] as const;

type CommunicationItem = {
  id: string;
  source: "history" | "scheduled";
  recipient_email: string;
  subject: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  attempts: number;
  error_message: string | null;
  created_by: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  display_date: string;
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

function getPositiveInteger(
  value: string | null,
  defaultValue: number,
  maximum: number
) {
  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return defaultValue;
  }

  return Math.min(
    parsedValue,
    maximum
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
        { status: 401 }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile
    ) {
      return NextResponse.json(
        {
          error:
            "Profil utilisateur introuvable.",
        },
        { status: 403 }
      );
    }

    const allowedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ARTISTIC_DIRECTOR,
    ];

    if (
      !allowedRoles.includes(
        profile.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Accès au centre de communication refusé.",
        },
        { status: 403 }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const requestedStatus =
      searchParams.get("status") ||
      "all";

    const requestedEntityType =
      searchParams.get(
        "entityType"
      ) || "all";

    const search =
      (
        searchParams.get(
          "search"
        ) || ""
      )
        .trim()
        .toLowerCase()
        .slice(0, 150);

    const page =
      getPositiveInteger(
        searchParams.get("page"),
        1,
        10000
      );

    const pageSize =
      getPositiveInteger(
        searchParams.get(
          "pageSize"
        ),
        25,
        100
      );

    const status =
      ALLOWED_STATUSES.includes(
        requestedStatus as (
          typeof ALLOWED_STATUSES
        )[number]
      )
        ? requestedStatus
        : "all";

    const entityType =
      ALLOWED_ENTITY_TYPES.includes(
        requestedEntityType as (
          typeof ALLOWED_ENTITY_TYPES
        )[number]
      )
        ? requestedEntityType
        : "all";

    const [
      emailLogsResult,
      scheduledEmailsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("crm_email_logs")
        .select(
          `
            id,
            recipient_email,
            subject,
            message,
            entity_type,
            entity_id,
            status,
            error_message,
            sent_by,
            sent_at
          `
        )
        .order("sent_at", {
          ascending: false,
        })
        .limit(1000),

      supabaseAdmin
        .from(
          "crm_scheduled_emails"
        )
        .select(
          `
            id,
            recipient_email,
            subject,
            message,
            entity_type,
            entity_id,
            status,
            attempts,
            error_message,
            created_by,
            scheduled_for,
            sent_at,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1000),
    ]);

    if (emailLogsResult.error) {
      throw new Error(
        `Erreur historique Gmail : ${emailLogsResult.error.message}`
      );
    }

    if (
      scheduledEmailsResult.error
    ) {
      throw new Error(
        `Erreur relances Gmail : ${scheduledEmailsResult.error.message}`
      );
    }

    const historyItems: CommunicationItem[] =
      (
        emailLogsResult.data ||
        []
      ).map((email) => ({
        id: email.id,
        source: "history",
        recipient_email:
          email.recipient_email,
        subject: email.subject,
        message: email.message,
        entity_type:
          email.entity_type,
        entity_id:
          email.entity_id,
        status: email.status,
        attempts: 0,
        error_message:
          email.error_message,
        created_by:
          email.sent_by,
        scheduled_for: null,
        sent_at: email.sent_at,
        created_at:
          email.sent_at,
        display_date:
          email.sent_at,
      }));

    /*
     * Une relance déjà envoyée ou échouée
     * existe aussi dans crm_email_logs.
     * On conserve ici uniquement les éléments
     * encore liés à la programmation afin
     * d’éviter les doublons.
     */
    const scheduledItems: CommunicationItem[] =
      (
        scheduledEmailsResult.data ||
        []
      )
        .filter((email) =>
          [
            "pending",
            "processing",
            "cancelled",
          ].includes(
            email.status
          )
        )
        .map((email) => ({
          id: email.id,
          source: "scheduled",
          recipient_email:
            email.recipient_email,
          subject: email.subject,
          message: email.message,
          entity_type:
            email.entity_type,
          entity_id:
            email.entity_id,
          status: email.status,
          attempts:
            Number(
              email.attempts || 0
            ),
          error_message:
            email.error_message,
          created_by:
            email.created_by,
          scheduled_for:
            email.scheduled_for,
          sent_at: email.sent_at,
          created_at:
            email.created_at,
          display_date:
            email.scheduled_for ||
            email.created_at,
        }));

    const allItems = [
      ...historyItems,
      ...scheduledItems,
    ].sort(
      (firstItem, secondItem) =>
        new Date(
          secondItem.display_date
        ).getTime() -
        new Date(
          firstItem.display_date
        ).getTime()
    );

    const statistics = {
      total: allItems.length,
      sent: historyItems.filter(
        (item) =>
          item.status === "sent"
      ).length,
      failed:
        historyItems.filter(
          (item) =>
            item.status ===
            "failed"
        ).length,
      pending:
        scheduledItems.filter(
          (item) =>
            item.status ===
            "pending"
        ).length,
      processing:
        scheduledItems.filter(
          (item) =>
            item.status ===
            "processing"
        ).length,
      cancelled:
        scheduledItems.filter(
          (item) =>
            item.status ===
            "cancelled"
        ).length,
    };

    const filteredItems =
      allItems.filter((item) => {
        if (
          status !== "all" &&
          item.status !== status
        ) {
          return false;
        }

        if (
          entityType !== "all" &&
          item.entity_type !==
            entityType
        ) {
          return false;
        }

        if (search) {
          const searchableText = [
            item.recipient_email,
            item.subject,
            item.message,
          ]
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(
              search
            )
          ) {
            return false;
          }
        }

        return true;
      });

    const total =
      filteredItems.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total / pageSize
        )
      );

    const safePage =
      Math.min(
        page,
        totalPages
      );

    const startIndex =
      (safePage - 1) *
      pageSize;

    const items =
      filteredItems.slice(
        startIndex,
        startIndex + pageSize
      );

    return NextResponse.json({
      items,
      statistics,
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
      },
      filters: {
        status,
        entityType,
        search,
      },
    });
  } catch (error) {
    console.error(
      "Erreur centre de communication :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger le centre de communication.",
      },
      { status: 500 }
    );
  }
}