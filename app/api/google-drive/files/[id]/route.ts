import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";
import { getCentralGoogleDrive } from "@/lib/google-drive-central.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

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
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const { data: profile } =
      await supabaseAdmin
        .from("profiles")
        .select("id, role, artiste_id")
        .eq("id", user.id)
        .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profil introuvable." },
        { status: 403 }
      );
    }

    const { data: file, error: fileError } =
      await supabaseAdmin
        .from("drive_files")
        .select(
          "id, nom, type, taille, uploaded_by, artiste_id, projet_id, storage_provider, google_drive_file_id"
        )
        .eq("google_drive_file_id", id)
        .eq(
          "storage_provider",
          "google_drive"
        )
        .single();

    if (fileError || !file) {
      return NextResponse.json(
        { error: "Fichier introuvable." },
        { status: 404 }
      );
    }

    let allowed =
      profile.role ===
        ROLES.SUPER_ADMIN ||
      profile.role === ROLES.ADMIN ||
      profile.role ===
        ROLES.ARTISTIC_DIRECTOR;

    if (
      !allowed &&
      profile.role === ROLES.MANAGER
    ) {
      allowed =
        file.uploaded_by === user.id;

      if (!allowed && file.artiste_id) {
        const { data: artiste } =
          await supabaseAdmin
            .from("artistes")
            .select("id")
            .eq("id", file.artiste_id)
            .eq("manager_id", user.id)
            .maybeSingle();

        allowed = Boolean(artiste);
      }

      if (!allowed && file.projet_id) {
        const { data: projet } =
          await supabaseAdmin
            .from("projets")
            .select(
              "id, artistes!inner(manager_id)"
            )
            .eq("id", file.projet_id)
            .eq(
              "artistes.manager_id",
              user.id
            )
            .maybeSingle();

        allowed = Boolean(projet);
      }
    }

    if (
  !allowed &&
  profile.role === ROLES.ARTISTE &&
  profile.artiste_id
) {
  allowed =
    file.artiste_id ===
    profile.artiste_id;

  if (
    !allowed &&
    file.projet_id
  ) {
    const { data: projet } =
      await supabaseAdmin
        .from("projets")
        .select("id")
        .eq(
          "id",
          file.projet_id
        )
        .eq(
          "artiste_id",
          profile.artiste_id
        )
        .maybeSingle();

    allowed = Boolean(projet);
  }
}

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas accès à ce fichier.",
        },
        { status: 403 }
      );
    }

    const { drive } =
      await getCentralGoogleDrive(
        request.nextUrl.origin
      );

    const googleResponse =
      await drive.files.get(
        {
          fileId:
            file.google_drive_file_id,
          alt: "media",
        },
        {
          responseType: "stream",
        }
      );

    const nodeStream =
      googleResponse.data as unknown as Readable;

    const webStream =
      Readable.toWeb(
        nodeStream
      ) as ReadableStream;

    const safeName =
      file.nom || "fichier";

    return new NextResponse(webStream, {
      headers: {
        "Content-Type":
          file.type ||
          "application/octet-stream",
        "Content-Disposition":
          `inline; filename*=UTF-8''${encodeURIComponent(
            safeName
          )}`,
        ...(file.taille
          ? {
              "Content-Length": String(
                file.taille
              ),
            }
          : {}),
        "Cache-Control":
          "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Erreur lecture fichier Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’ouvrir ce fichier.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

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
        .select("id, role")
        .eq("id", user.id)
        .single();

    const { data: file } =
      await supabaseAdmin
        .from("drive_files")
        .select(
          "id, uploaded_by, storage_provider, google_drive_file_id"
        )
        .eq(
          "google_drive_file_id",
          id
        )
        .eq(
          "storage_provider",
          "google_drive"
        )
        .single();

    if (!profile || !file) {
      return NextResponse.json(
        { error: "Fichier introuvable." },
        { status: 404 }
      );
    }

    const allowed =
      profile.role ===
        ROLES.SUPER_ADMIN ||
      profile.role === ROLES.ADMIN ||
      profile.role ===
        ROLES.ARTISTIC_DIRECTOR ||
      (
        profile.role === ROLES.MANAGER &&
        file.uploaded_by === user.id
      );

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Tu n’as pas l’autorisation de supprimer ce fichier.",
        },
        { status: 403 }
      );
    }

    const { drive } =
      await getCentralGoogleDrive(
        request.nextUrl.origin
      );

    await drive.files.delete({
      fileId:
        file.google_drive_file_id,
    });

    const { error: deleteError } =
      await supabaseAdmin
        .from("drive_files")
        .delete()
        .eq("id", file.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur suppression fichier Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de supprimer ce fichier.",
      },
      { status: 500 }
    );
  }
}