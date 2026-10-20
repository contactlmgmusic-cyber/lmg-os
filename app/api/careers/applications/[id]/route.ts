import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

const allowedStatuses = [
  "new",
  "review",
  "interview",
  "selected",
  "rejected",
  "talent_pool",
] as const;

async function authorize() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return createAuthenticatedSupabaseClient();
}

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const supabase = await authorize();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("careers_applications")
      .select(`
        *,
        careers_jobs (
          id,
          title,
          slug,
          department,
          employment_type,
          location
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const supabase = await authorize();
    const { id } = await context.params;
    const body = await request.json();

    if (body.mode === "planning") {
      const assignedTo = body.assignedTo || null;
      const nextAction = typeof body.nextAction === "string" ? body.nextAction.trim() : "";
      const nextActionAt = body.nextActionAt || null;
      if (assignedTo !== null && typeof assignedTo !== "string") {
        return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
      }
      if (nextAction.length > 500 || (nextActionAt && Number.isNaN(Date.parse(nextActionAt)))) {
        return NextResponse.json({ error: "Invalid planning" }, { status: 400 });
      }
      const { error } = await supabase.rpc("manage_careers_planning", {
        p_application_id: id,
        p_assigned_to: assignedTo,
        p_next_action: nextAction || null,
        p_next_action_at: nextActionAt,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (body.mode === "interview") {
      const start = typeof body.start === "string" ? body.start : "";
      const end = typeof body.end === "string" ? body.end : "";
      const participants = Array.isArray(body.participantIds)
        ? body.participantIds.filter((value: unknown): value is string => typeof value === "string")
        : [];
      const reminder = Number(body.reminderMinutes);
      if (!start || !end || Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end)) || ![0, 15, 30, 60, 120, 1440].includes(reminder)) {
        return NextResponse.json({ error: "Invalid interview" }, { status: 400 });
      }
      const { data: eventId, error } = await supabase.rpc("schedule_careers_interview", {
        p_application_id: id,
        p_start: start,
        p_end: end,
        p_location: typeof body.location === "string" ? body.location : "",
        p_video_link: typeof body.videoLink === "string" ? body.videoLink : "",
        p_participant_ids: participants,
        p_reminder_minutes: reminder,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, eventId });
    }

    let status: string | null = null;
    let note: string | null = null;

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      status = body.status;
    }

    if (body.note !== undefined) {
      if (typeof body.note !== "string" || body.note.trim().length > 5000) {
        return NextResponse.json({ error: "Invalid note" }, { status: 400 });
      }
      note = body.note.trim() || null;
    }

    if (status === null && note === null) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc("manage_careers_application", {
      p_application_id: id,
      p_status: status,
      p_note: note,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
