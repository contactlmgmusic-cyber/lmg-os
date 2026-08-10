import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCentralGoogleDrive } from "@/lib/google-drive-central.server";
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

export async function POST(request: NextRequest) {
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

    const supabaseAdmin = createSupabaseAdmin();

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
        .select("id, role")
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
        {
          error:
            "Tu n’as pas l’autorisation d’ajouter un fichier.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const fileName =
      typeof body.fileName === "string"
        ? body.fileName.trim()
        : "";

    const mimeType =
      typeof body.mimeType === "string" &&
      body.mimeType
        ? body.mimeType
        : "application/octet-stream";

    const fileSize = Number(body.fileSize);

    const artisteId =
      typeof body.artisteId === "string" &&
      body.artisteId
        ? body.artisteId
        : null;

    const projetId =
      typeof body.projetId === "string" &&
      body.projetId
        ? body.projetId
        : null;

    if (
      !fileName ||
      !Number.isFinite(fileSize) ||
      fileSize <= 0
    ) {
      return NextResponse.json(
        { error: "Fichier invalide." },
        { status: 400 }
      );
    }

    if (profile.role === ROLES.MANAGER) {
      if (artisteId) {
        const { data: artiste } =
          await supabaseAdmin
            .from("artistes")
            .select("id")
            .eq("id", artisteId)
            .eq("manager_id", user.id)
            .maybeSingle();

        if (!artiste) {
          return NextResponse.json(
            {
              error:
                "Cet artiste ne t’est pas attribué.",
            },
            { status: 403 }
          );
        }
      }

      if (projetId) {
        const { data: projet } =
          await supabaseAdmin
            .from("projets")
            .select(
              "id, artistes!inner(manager_id)"
            )
            .eq("id", projetId)
            .eq(
              "artistes.manager_id",
              user.id
            )
            .maybeSingle();

        if (!projet) {
          return NextResponse.json(
            {
              error:
                "Ce projet ne t’est pas attribué.",
            },
            { status: 403 }
          );
        }
      }
    }

    const {
      oauth2Client,
      rootFolderId,
    } = await getCentralGoogleDrive(
      request.nextUrl.origin
    );

    const { token: googleAccessToken } =
      await oauth2Client.getAccessToken();

    if (!googleAccessToken) {
      throw new Error(
        "Token Google Drive indisponible."
      );
    }

    const googleResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,parents",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${googleAccessToken}`,
          "Content-Type":
            "application/json; charset=UTF-8",
          "X-Upload-Content-Type":
            mimeType,
          "X-Upload-Content-Length":
            String(fileSize),
        },
        body: JSON.stringify({
          name: fileName,
          mimeType,
          parents: [rootFolderId],
        }),
      }
    );

    if (!googleResponse.ok) {
      const googleError =
        await googleResponse.text();

      console.error(
        "Erreur initialisation upload Drive :",
        googleError
      );

      throw new Error(
        "Impossible de préparer l’envoi vers Google Drive."
      );
    }

    const uploadUrl =
      googleResponse.headers.get("location");

    if (!uploadUrl) {
      throw new Error(
        "URL d’envoi Google Drive absente."
      );
    }

    return NextResponse.json({
      uploadUrl,
    });
  } catch (error) {
    console.error(
      "Erreur démarrage upload Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de démarrer l’upload.",
      },
      { status: 500 }
    );
  }
}