import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js";
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

async function authenticate(
  request: NextRequest
): Promise<{
  userId: string;
  role: string;
  supabaseAdmin: SupabaseClient;
} | null> {
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
    return null;
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
    return null;
  }

  return {
    userId: user.id,
    role: profile.role,
    supabaseAdmin,
  };
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

function validEntityType(
  value: string
): value is EntityType {
  return ENTITY_TYPES.includes(
    value as EntityType
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const auth =
      await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        {
          error:
            "Authentification ou autorisation requise.",
        },
        { status: 401 }
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
      !validEntityType(entityType) ||
      !entityId ||
      !validUuid(entityId)
    ) {
      return NextResponse.json(
        {
          error:
            "Contexte CRM invalide.",
        },
        { status: 400 }
      );
    }

    const canAccess =
  await canAccessCrmEmailEntity({
    supabaseAdmin:
      auth.supabaseAdmin,
    userId: auth.userId,
    role: auth.role,
    entityType,
    entityId,
  });

if (!canAccess) {
  return NextResponse.json(
    {
      error:
        "Tu n’as pas accès aux relances de cette fiche.",
    },
    { status: 403 }
  );
}

    const {
      data: scheduledEmails,
      error,
    } = await auth.supabaseAdmin
      .from("crm_scheduled_emails")
      .select(
        "id, recipient_email, subject, message, scheduled_for, status, attempts, error_message, sent_at, created_at"
      )
      .eq(
        "entity_type",
        entityType
      )
      .eq("entity_id", entityId)
      .order("scheduled_for", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      scheduledEmails:
        scheduledEmails || [],
    });
  } catch (error) {
    console.error(
      "Erreur liste relances :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger les relances programmées.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const auth =
      await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        {
          error:
            "Authentification ou autorisation requise.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const recipientEmail =
      String(
        body.recipientEmail || ""
      ).trim();

    const subject =
      String(
        body.subject || ""
      ).trim();

    const message =
      String(
        body.message || ""
      ).trim();

    const entityType =
      String(
        body.entityType || ""
      );

    const entityId =
      String(
        body.entityId || ""
      );

    const scheduledFor =
      new Date(body.scheduledFor);

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        recipientEmail
      );

    if (
  !validEmail ||
  !subject ||
  !message ||
  containsHeaderInjection(
    recipientEmail
  ) ||
  containsHeaderInjection(
    subject
  ) ||
  !validEntityType(entityType) ||
  !validUuid(entityId) ||
  Number.isNaN(
    scheduledFor.getTime()
  )
) {
      return NextResponse.json(
        {
          error:
            "Informations de relance invalides.",
        },
        { status: 400 }
      );
    }

    const canAccess =
  await canAccessCrmEmailEntity({
    supabaseAdmin:
      auth.supabaseAdmin,
    userId: auth.userId,
    role: auth.role,
    entityType,
    entityId,
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

    const now = Date.now();

    const maximumDate =
      now +
      365 *
        24 *
        60 *
        60 *
        1000;

    if (
      scheduledFor.getTime() <= now ||
      scheduledFor.getTime() >
        maximumDate
    ) {
      return NextResponse.json(
        {
          error:
            "La relance doit être programmée entre demain et un an.",
        },
        { status: 400 }
      );
    }

    if (
      subject.length > 200 ||
      message.length > 50000
    ) {
      return NextResponse.json(
        {
          error:
            "Le contenu de la relance est trop long.",
        },
        { status: 400 }
      );
    }

    const {
      data: scheduledEmail,
      error,
    } = await auth.supabaseAdmin
      .from("crm_scheduled_emails")
      .insert({
        created_by: auth.userId,
        recipient_email:
          recipientEmail,
        subject,
        message,
        entity_type:
          entityType,
        entity_id: entityId,
        scheduled_for:
          scheduledFor.toISOString(),
        status: "pending",
      })
      .select(
        "id, scheduled_for, status"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      scheduledEmail,
    });
  } catch (error) {
    console.error(
      "Erreur programmation relance :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de programmer la relance.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const auth =
      await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        {
          error:
            "Authentification ou autorisation requise.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const id = String(
      body.id || ""
    ).trim();

    if (!validUuid(id)) {
      return NextResponse.json(
        {
          error:
            "Relance invalide.",
        },
        { status: 400 }
      );
    }

    const {
  data: scheduledEmail,
  error: readError,
} = await auth.supabaseAdmin
  .from("crm_scheduled_emails")
  .select(
    "id, created_by, status, attempts, entity_type, entity_id"
  )
  .eq("id", id)
  .single();

if (
  readError ||
  !scheduledEmail
) {
  return NextResponse.json(
    {
      error:
        "Relance introuvable.",
    },
    { status: 404 }
  );
}

if (
  !validEntityType(
    scheduledEmail.entity_type
  ) ||
  !validUuid(
    scheduledEmail.entity_id
  )
) {
  return NextResponse.json(
    {
      error:
        "Contexte CRM de la relance invalide.",
    },
    { status: 400 }
  );
}

const canAccess =
  await canAccessCrmEmailEntity({
    supabaseAdmin:
      auth.supabaseAdmin,
    userId: auth.userId,
    role: auth.role,
    entityType:
      scheduledEmail.entity_type,
    entityId:
      scheduledEmail.entity_id,
  });

if (!canAccess) {
  return NextResponse.json(
    {
      error:
        "Tu n’as pas accès à cette relance.",
    },
    { status: 403 }
  );
}

    const canRetryAll =
      auth.role ===
        ROLES.SUPER_ADMIN ||
      auth.role ===
        ROLES.ADMIN ||
      auth.role ===
        ROLES.ARTISTIC_DIRECTOR;

    if (
      !canRetryAll &&
      scheduledEmail.created_by !==
        auth.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Tu ne peux pas relancer cet e-mail.",
        },
        { status: 403 }
      );
    }

    if (
      scheduledEmail.status !==
      "failed"
    ) {
      return NextResponse.json(
        {
          error:
            "Seules les relances en échec peuvent être réessayées.",
        },
        { status: 400 }
      );
    }

    if (
      Number(
        scheduledEmail.attempts || 0
      ) >= 3
    ) {
      return NextResponse.json(
        {
          error:
            "Le nombre maximal de 3 tentatives est atteint.",
        },
        { status: 400 }
      );
    }

    const retryDate =
      new Date().toISOString();

    const {
      data: retriedEmail,
      error: updateError,
    } = await auth.supabaseAdmin
      .from("crm_scheduled_emails")
      .update({
        status: "pending",
        scheduled_for: retryDate,
        error_message: null,
        updated_at: retryDate,
      })
      .eq("id", id)
      .eq("status", "failed")
      .select(
        "id, status, attempts, scheduled_for"
      )
      .single();

    if (
      updateError ||
      !retriedEmail
    ) {
      throw (
        updateError ||
        new Error(
          "La relance n’a pas pu être réactivée."
        )
      );
    }

    return NextResponse.json({
      success: true,
      scheduledEmail:
        retriedEmail,
    });
  } catch (error) {
    console.error(
      "Erreur nouvelle tentative de relance :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de réessayer cette relance.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const auth =
      await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        {
          error:
            "Authentification ou autorisation requise.",
        },
        { status: 401 }
      );
    }

    const id =
      request.nextUrl.searchParams.get(
        "id"
      );

    if (!id || !validUuid(id)) {
      return NextResponse.json(
        {
          error:
            "Relance invalide.",
        },
        { status: 400 }
      );
    }

    const {
  data: scheduledEmail,
  error: readError,
} = await auth.supabaseAdmin
  .from("crm_scheduled_emails")
  .select(
    "id, created_by, status, entity_type, entity_id"
  )
  .eq("id", id)
  .single();

if (
  readError ||
  !scheduledEmail
) {
  return NextResponse.json(
    {
      error:
        "Relance introuvable.",
    },
    { status: 404 }
  );
}

if (
  !validEntityType(
    scheduledEmail.entity_type
  ) ||
  !validUuid(
    scheduledEmail.entity_id
  )
) {
  return NextResponse.json(
    {
      error:
        "Contexte CRM de la relance invalide.",
    },
    { status: 400 }
  );
}

const canAccess =
  await canAccessCrmEmailEntity({
    supabaseAdmin:
      auth.supabaseAdmin,
    userId: auth.userId,
    role: auth.role,
    entityType:
      scheduledEmail.entity_type,
    entityId:
      scheduledEmail.entity_id,
  });

if (!canAccess) {
  return NextResponse.json(
    {
      error:
        "Tu n’as pas accès à cette relance.",
    },
    { status: 403 }
  );
}

    const canCancelAll =
      auth.role ===
        ROLES.SUPER_ADMIN ||
      auth.role === ROLES.ADMIN ||
      auth.role ===
        ROLES.ARTISTIC_DIRECTOR;

    if (
      !canCancelAll &&
      scheduledEmail.created_by !==
        auth.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Tu ne peux pas annuler cette relance.",
        },
        { status: 403 }
      );
    }

    if (
      scheduledEmail.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "Cette relance ne peut plus être annulée.",
        },
        { status: 400 }
      );
    }

    const { error } =
      await auth.supabaseAdmin
        .from(
          "crm_scheduled_emails"
        )
        .update({
          status: "cancelled",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "pending");

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur annulation relance :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’annuler la relance.",
      },
      { status: 500 }
    );
  }
}