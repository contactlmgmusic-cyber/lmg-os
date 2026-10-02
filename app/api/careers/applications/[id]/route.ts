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

    const updates: {
      status?: string;
      internal_notes?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (body.internal_notes !== undefined) {
      updates.internal_notes =
        typeof body.internal_notes === "string"
          ? body.internal_notes.trim() || null
          : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("careers_applications")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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
