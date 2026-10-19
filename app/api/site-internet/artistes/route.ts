import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function availableSlug(
  supabase: Awaited<ReturnType<typeof createAuthenticatedSupabaseClient>>,
  artistId: string,
  name: string,
) {
  const base = slugify(name);
  if (!base) return null;

  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const { data, error } = await supabase
      .from("artistes")
      .select("id")
      .eq("slug", candidate)
      .neq("id", artistId)
      .limit(1);

    if (error) throw error;
    if (!data?.length) return candidate;
  }

  return null;
}

async function adminClient() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === ROLES.SUPER_ADMIN || profile?.role === ROLES.ADMIN ? supabase : null;
}

export async function GET() {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const { data, error } = await supabase.from("artistes").select("id, nom, slug, style, photo_url, is_public, featured, display_order").order("display_order").order("nom");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artists: data || [] });
}

export async function PATCH(request: Request) {
  const supabase = await adminClient();
  if (!supabase) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Artiste invalide." }, { status: 400 });
  const patch: {
    is_public?: boolean;
    featured?: boolean;
    display_order?: number;
    slug?: string;
  } = {
    ...(typeof body.is_public === "boolean" ? { is_public: body.is_public } : {}),
    ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
    ...(Number.isFinite(body.display_order) ? { display_order: Math.max(0, Math.round(body.display_order)) } : {}),
  };
  if (patch.is_public === false) Object.assign(patch, { featured: false });
  if (patch.featured === true) Object.assign(patch, { is_public: true });

  if (patch.is_public === true) {
    const { data: artist, error: artistError } = await supabase
      .from("artistes")
      .select("id, nom, slug")
      .eq("id", body.id)
      .maybeSingle();

    if (artistError) {
      return NextResponse.json({ error: artistError.message }, { status: 400 });
    }
    if (!artist) {
      return NextResponse.json({ error: "Artiste introuvable." }, { status: 404 });
    }
    if (!artist.nom?.trim()) {
      return NextResponse.json(
        { error: "Ajoute un nom à l’artiste avant de publier sa page." },
        { status: 400 },
      );
    }

    if (!artist.slug?.trim()) {
      try {
        const slug = await availableSlug(supabase, artist.id, artist.nom);
        if (!slug) {
          return NextResponse.json(
            { error: "Impossible de créer une adresse publique unique pour cet artiste." },
            { status: 409 },
          );
        }
        patch.slug = slug;
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Vérification de l’adresse publique impossible." },
          { status: 400 },
        );
      }
    }
  }
  const { data: updatedArtist, error } = await supabase
    .from("artistes")
    .update(patch)
    .eq("id", body.id)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!updatedArtist) {
    return NextResponse.json(
      { error: "La publication n’a pas été enregistrée. Vérifie tes droits sur cet artiste." },
      { status: 403 },
    );
  }
  return NextResponse.json({ patch });
}

