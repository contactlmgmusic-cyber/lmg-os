import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { syncGoogleCalendarForUser } from "@/lib/google-calendar-sync.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

async function syncTaskParticipants({
  taskId,
  currentUserId,
  origin,
  supabaseAdmin,
}: {
  taskId: string;
  currentUserId: string;
  origin: string;
  supabaseAdmin: SupabaseClient;
}) {
  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", currentUserId)
      .single();

  if (profileError || !profile) {
    throw new Error(
      "Profil utilisateur introuvable."
    );
  }

  const allowedRoles: string[] = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.ARTISTIC_DIRECTOR,
  ];

  if (!allowedRoles.includes(profile.role)) {
    throw new Error(
      "Tu n’as pas l’autorisation de synchroniser cette tâche."
    );
  }

  const { data: task, error: taskError } =
    await supabaseAdmin
      .from("taches")
      .select("id, responsable_id")
      .eq("id", taskId)
      .single();

  if (taskError || !task) {
    throw new Error("Tâche introuvable.");
  }

  const {
    data: assignments,
    error: assignmentsError,
  } = await supabaseAdmin
    .from("task_assignees")
    .select("user_id")
    .eq("task_id", taskId);

  if (assignmentsError) {
    throw assignmentsError;
  }

  const participantIds = Array.from(
    new Set([
      ...(assignments || []).map(
        (assignment) => assignment.user_id
      ),
      ...(task.responsable_id
        ? [task.responsable_id]
        : []),
    ])
  );

  if (participantIds.length === 0) {
    return {
      participants: 0,
      synchronized: 0,
      skipped: 0,
      failed: 0,
    };
  }

  const {
    data: connections,
    error: connectionsError,
  } = await supabaseAdmin
    .from("google_calendar_connections")
    .select("user_id")
    .in("user_id", participantIds);

  if (connectionsError) {
    throw connectionsError;
  }

  const connectedUserIds = new Set(
    (connections || []).map(
      (connection) => connection.user_id
    )
  );

  let synchronized = 0;
  let skipped = 0;
  let failed = 0;

  for (const participantId of participantIds) {
    if (!connectedUserIds.has(participantId)) {
      skipped += 1;
      continue;
    }

    try {
      await syncGoogleCalendarForUser(
        participantId,
        origin
      );

      synchronized += 1;
    } catch (error) {
      failed += 1;

      console.error(
        `Erreur synchronisation Calendar du participant ${participantId} :`,
        error
      );
    }
  }

  return {
    participants: participantIds.length,
    synchronized,
    skipped,
    failed,
  };
}

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get("authorization");

    const accessToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Session manquante." },
        { status: 401 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error(
        "Configuration Supabase indisponible."
      );
    }

    const supabaseAuth = createClient(
      supabaseUrl,
      anonKey,
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
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    let taskId: string | null = null;

    try {
      const body = await request.json();

      taskId =
        typeof body?.taskId === "string"
          ? body.taskId
          : null;
    } catch {
      taskId = null;
    }

    const origin =
      new URL(request.url).origin;

    if (!taskId) {
      const result =
        await syncGoogleCalendarForUser(
          user.id,
          origin
        );

      return NextResponse.json({
        success: true,
        mode: "user",
        ...result,
      });
    }

    const validTaskId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        taskId
      );

    if (!validTaskId) {
      return NextResponse.json(
        { error: "Identifiant de tâche invalide." },
        { status: 400 }
      );
    }

    const result =
      await syncTaskParticipants({
        taskId,
        currentUserId: user.id,
        origin,
        supabaseAdmin:
          createSupabaseAdmin(),
      });

    return NextResponse.json({
      success: true,
      mode: "task",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : JSON.stringify(error);

    console.error(
      "Erreur synchronisation Google Calendar :",
      error
    );

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