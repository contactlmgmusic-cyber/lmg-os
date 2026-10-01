import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

async function adminClient() {
  const supabase = await createAuthenticatedSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === ROLES.SUPER_ADMIN ||
    profile?.role === ROLES.ADMIN
    ? supabase
    : null;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(value: unknown) {
  const valueString = cleanString(value);
  return valueString || null;
}

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const supabase = await adminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("site_news")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    news: data || [],
  });
}

export async function POST(request: Request) {
  const supabase = await adminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  const titleFr = cleanString(body?.title_fr);
  const titleEn = cleanString(body?.title_en);

  if (!titleFr && !titleEn) {
    return NextResponse.json(
      { error: "Ajoute au moins un titre FR ou EN." },
      { status: 400 }
    );
  }

  const baseSlug =
    cleanString(body?.slug) ||
    makeSlug(titleFr || titleEn);

  if (!baseSlug) {
    return NextResponse.json(
      { error: "Slug invalide." },
      { status: 400 }
    );
  }

  const status =
    body?.status === "published"
      ? "published"
      : "draft";

  const payload = {
    slug: baseSlug,
    title_fr: titleFr || null,
    title_en: titleEn || null,
    excerpt_fr: nullableString(body?.excerpt_fr),
    excerpt_en: nullableString(body?.excerpt_en),
    content_fr: nullableString(body?.content_fr),
    content_en: nullableString(body?.content_en),
    category_fr: nullableString(body?.category_fr),
    category_en: nullableString(body?.category_en),
    image_url: nullableString(body?.image_url),
    status,
    featured: body?.featured === true,
    published_at:
      status === "published"
        ? body?.published_at || new Date().toISOString()
        : body?.published_at || null,
  };

  const { data, error } = await supabase
    .from("site_news")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { article: data },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const supabase = await adminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.id) {
    return NextResponse.json(
      { error: "Article invalide." },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = {};

  const stringFields = [
    "title_fr",
    "title_en",
    "excerpt_fr",
    "excerpt_en",
    "content_fr",
    "content_en",
    "category_fr",
    "category_en",
    "image_url",
  ];

  for (const field of stringFields) {
    if (field in body) {
      patch[field] = nullableString(body[field]);
    }
  }

  if ("slug" in body) {
    const slug = makeSlug(cleanString(body.slug));

    if (!slug) {
      return NextResponse.json(
        { error: "Slug invalide." },
        { status: 400 }
      );
    }

    patch.slug = slug;
  }

  if (typeof body.featured === "boolean") {
    patch.featured = body.featured;
  }

  if (
    body.status === "draft" ||
    body.status === "published"
  ) {
    patch.status = body.status;

    if (
      body.status === "published" &&
      !body.published_at
    ) {
      patch.published_at = new Date().toISOString();
    }
  }

  if ("published_at" in body) {
    patch.published_at =
      body.published_at || null;
  }

  const { data, error } = await supabase
    .from("site_news")
    .update(patch)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    article: data,
  });
}

export async function DELETE(request: Request) {
  const supabase = await adminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.id) {
    return NextResponse.json(
      { error: "Article invalide." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("site_news")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
