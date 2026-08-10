import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ROLES } from "@/lib/roles";

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

export async function PUT(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get("authorization");

    const sessionToken =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 }
      );
    }

    const supabaseAdmin =
      createSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      sessionToken
    );

    if (userError || !user) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

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
      ROLES.MANAGER,
    ];

    if (
      !profile ||
      !allowedRoles.includes(profile.role)
    ) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const uploadUrl =
      request.headers.get(
        "x-google-upload-url"
      );

    const contentRange =
      request.headers.get(
        "content-range"
      );

    const contentType =
      request.headers.get(
        "x-file-content-type"
      ) ||
      "application/octet-stream";

    if (!uploadUrl || !contentRange) {
      return NextResponse.json(
        {
          error:
            "Informations d’upload manquantes.",
        },
        { status: 400 }
      );
    }

    const parsedUrl =
      new URL(uploadUrl);

    if (
      parsedUrl.origin !==
        "https://www.googleapis.com" ||
      !parsedUrl.pathname.startsWith(
        "/upload/drive/v3/files"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "URL Google Drive invalide.",
        },
        { status: 400 }
      );
    }

    const chunk =
      await request.arrayBuffer();

    const googleResponse = await fetch(
      uploadUrl,
      {
        method: "PUT",
        redirect: "manual",
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(
            chunk.byteLength
          ),
          "Content-Range": contentRange,
        },
        body: chunk,
      }
    );

    if (googleResponse.status === 308) {
      return NextResponse.json({
        complete: false,
        received:
          googleResponse.headers.get(
            "range"
          ),
      });
    }

    if (!googleResponse.ok) {
      const googleError =
        await googleResponse.text();

      console.error(
        "Erreur chunk Google Drive :",
        googleError
      );

      return NextResponse.json(
        {
          error:
            "Google Drive a refusé une partie du fichier.",
        },
        { status: 502 }
      );
    }

    const googleFile =
      await googleResponse.json();

    return NextResponse.json({
      complete: true,
      file: googleFile,
    });
  } catch (error) {
    console.error(
      "Erreur upload chunk Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’envoyer cette partie du fichier.",
      },
      { status: 500 }
    );
  }
}