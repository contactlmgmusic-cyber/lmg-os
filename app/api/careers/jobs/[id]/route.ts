import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

async function authorize() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return createAuthenticatedSupabaseClient();
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedStatuses = [
  "draft",
  "published",
  "closed",
  "archived",
];

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const supabase = await authorize();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("careers_jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Careers job GET error:", error);

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await authorize();
    const { id } = await context.params;
    const body = await request.json();

    const status = String(body.status || "");

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide." },
        { status: 400 }
      );
    }

    const { data: current, error: currentError } =
      await supabase
        .from("careers_jobs")
        .select("id,status,published_at")
        .eq("id", id)
        .single();

    if (currentError || !current) {
      return NextResponse.json(
        { error: "Offre introuvable." },
        { status: 404 }
      );
    }

    const update: {
      status: string;
      published_at?: string | null;
    } = {
      status,
    };

    if (
      status === "published" &&
      !current.published_at
    ) {
      update.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("careers_jobs")
      .update(update)
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
  } catch (error) {
    console.error("Careers job PATCH error:", error);

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}
