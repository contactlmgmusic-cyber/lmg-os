import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { isSameOriginMutation } from "@/lib/same-origin-request.server";

async function authorize() {
  const profile = await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const supabase = await createAuthenticatedSupabaseClient();

  return { supabase, profile };
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const { supabase } = await authorize();

    const { data, error } = await supabase
      .from("careers_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Careers jobs GET error:", error);

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
    const { supabase, profile } = await authorize();
    const body = await request.json();

    const bounded = (value: unknown, maximum: number) => {
      const result = typeof value === "string" ? value.trim() : "";
      if (result.length > maximum) throw new Error("INVALID_INPUT");
      return result;
    };
    const title = bounded(body.title, 180);
    const description = bounded(body.description, 15000);

    if (!title || !description) {
      return NextResponse.json(
        { error: "Le titre et la description sont obligatoires." },
        { status: 400 }
      );
    }

    const allowedDepartments = [
      "music",
      "creative",
      "business",
      "tech_digital",
    ];

    const allowedEmploymentTypes = [
      "cdi",
      "cdd",
      "stage",
      "alternance",
      "freelance",
      "project",
    ];

    const allowedRemotePolicies = [
      "onsite",
      "hybrid",
      "remote",
    ];

    const status =
      body.status === "published"
        ? "published"
        : "draft";

    const department = String(body.department || "");
    const employmentType = String(body.employment_type || "");
    const remotePolicy = String(body.remote_policy || "");

    if (!allowedDepartments.includes(department)) {
      return NextResponse.json(
        { error: "Univers invalide." },
        { status: 400 }
      );
    }

    if (!allowedEmploymentTypes.includes(employmentType)) {
      return NextResponse.json(
        { error: "Type de contrat invalide." },
        { status: 400 }
      );
    }

    if (
      remotePolicy &&
      !allowedRemotePolicies.includes(remotePolicy)
    ) {
      return NextResponse.json(
        { error: "Mode de travail invalide." },
        { status: 400 }
      );
    }

    const baseSlug = createSlug(title);

    if (!baseSlug) {
      return NextResponse.json(
        { error: "Impossible de générer le slug." },
        { status: 400 }
      );
    }

    let slug = baseSlug;

    const { data: existing } = await supabase
      .from("careers_jobs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
    }

    const closeDate = body.closes_at ? new Date(String(body.closes_at)) : null;
    if (closeDate && Number.isNaN(closeDate.getTime())) return NextResponse.json({ error: "Date de clôture invalide." }, { status: 400 });
    const applicationEmail = bounded(body.application_email, 254);
    if (applicationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationEmail)) return NextResponse.json({ error: "Email de contact invalide." }, { status: 400 });

    const payload = {
      title,
      slug,
      department,
      employment_type: employmentType,
      location: bounded(body.location, 200) || null,
      remote_policy: remotePolicy || null,

      short_description:
        bounded(body.short_description, 500) || null,

      description,

      responsibilities:
        bounded(body.responsibilities, 10000) || null,

      profile:
        bounded(body.profile, 10000) || null,

      benefits:
        bounded(body.benefits, 10000) || null,

      application_email:
        applicationEmail || null,

      status,

      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,

      closes_at:
        closeDate ? closeDate.toISOString() : null,

      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from("careers_jobs")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Careers jobs POST error:", error);

    if (error instanceof Error && error.message === "INVALID_INPUT") {
      return NextResponse.json({ error: "Un ou plusieurs champs sont trop longs." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }
}
