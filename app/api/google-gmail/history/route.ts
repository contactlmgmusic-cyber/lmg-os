import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENTITY_TYPES = [
  "media",
  "influenceur",
  "partenaire",
  "prospect",
];

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
    } = await supabaseAuth.auth.getUser();

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
            "Accès refusé.",
        },
        { status: 403 }
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

    const validEntityId =
      entityId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        entityId
      );

    if (
      !entityType ||
      !ENTITY_TYPES.includes(
        entityType
      ) ||
      !validEntityId
    ) {
      return NextResponse.json(
        {
          error:
            "Contexte CRM invalide.",
        },
        { status: 400 }
      );
    }

    const {
      data: emails,
      error,
    } = await supabaseAdmin
      .from("crm_email_logs")
      .select(
        "id, recipient_email, subject, message, status, error_message, sent_by, sent_at"
      )
      .eq(
        "entity_type",
        entityType
      )
      .eq("entity_id", entityId)
      .order("sent_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      emails: emails || [],
    });
  } catch (error) {
    console.error(
      "Erreur historique Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger l’historique des e-mails.",
      },
      { status: 500 }
    );
  }
}