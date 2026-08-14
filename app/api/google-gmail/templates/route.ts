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

    if (
      !entityType ||
      !ENTITY_TYPES.includes(
        entityType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Type CRM invalide.",
        },
        { status: 400 }
      );
    }

    const {
      data: templates,
      error,
    } = await supabaseAdmin
      .from("crm_email_templates")
      .select(
        "id, name, entity_type, subject, message"
      )
      .eq("is_active", true)
      .or(
        `entity_type.is.null,entity_type.eq.${entityType}`
      )
      .order("name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      templates:
        templates || [],
    });
  } catch (error) {
    console.error(
      "Erreur modèles Gmail :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger les modèles d’e-mails.",
      },
      { status: 500 }
    );
  }
}