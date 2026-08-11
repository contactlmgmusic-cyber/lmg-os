import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getCentralGoogleDrive,
  getOrCreateDriveFolder,
} from "@/lib/google-drive-central.server";
import { ROLES } from "@/lib/roles";

export const runtime = "nodejs";

const allowedCategories = [
  "Master",
  "Cover",
  "Clip",
  "Photo presse",
  "EPK",
  "Contrat",
  "Document interne",
  "Autre",
];

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

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        "authorization"
      );

    const sessionToken =
      authorization?.startsWith(
        "Bearer "
      )
        ? authorization.slice(7)
        : null;

    if (!sessionToken) {
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

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
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
      !allowedRoles.includes(
        profile.role
      )
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
      typeof body.mimeType ===
        "string" && body.mimeType
        ? body.mimeType
        : "application/octet-stream";

    const fileSize = Number(
      body.fileSize
    );

    const categorie =
      typeof body.categorie ===
        "string" &&
      allowedCategories.includes(
        body.categorie
      )
        ? body.categorie
        : "Autre";

    const artisteId =
      typeof body.artisteId ===
        "string" && body.artisteId
        ? body.artisteId
        : null;

    const projetId =
      typeof body.projetId ===
        "string" && body.projetId
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

    if (
      profile.role === ROLES.MANAGER
    ) {
      if (artisteId) {
        const { data: artiste } =
          await supabaseAdmin
            .from("artistes")
            .select("id")
            .eq("id", artisteId)
            .eq(
              "manager_id",
              user.id
            )
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
      drive,
      oauth2Client,
      rootFolderId,
    } =
      await getCentralGoogleDrive(
        request.nextUrl.origin
      );

    let targetFolderId =
      rootFolderId;

    let linkedArtistId:
      string | null = artisteId;

    let artistName:
      string | null = null;

    let projectName:
      string | null = null;

    if (projetId) {
      const { data: project } =
        await supabaseAdmin
          .from("projets")
          .select(
            "id, titre, artiste_id"
          )
          .eq("id", projetId)
          .single();

      if (!project) {
        return NextResponse.json(
          {
            error:
              "Projet introuvable.",
          },
          { status: 404 }
        );
      }

      projectName =
        project.titre || "Projet";

      if (
        linkedArtistId &&
        project.artiste_id &&
        linkedArtistId !==
          project.artiste_id
      ) {
        return NextResponse.json(
          {
            error:
              "Ce projet n’appartient pas à l’artiste sélectionné.",
          },
          { status: 400 }
        );
      }

      linkedArtistId =
        linkedArtistId ||
        project.artiste_id ||
        null;
    }

    if (linkedArtistId) {
      const { data: artist } =
        await supabaseAdmin
          .from("artistes")
          .select("id, nom")
          .eq(
            "id",
            linkedArtistId
          )
          .single();

      if (!artist) {
        return NextResponse.json(
          {
            error:
              "Artiste introuvable.",
          },
          { status: 404 }
        );
      }

      artistName =
        artist.nom || "Artiste";
    }

    if (artistName) {
      const artistsFolderId =
        await getOrCreateDriveFolder({
          drive,
          name: "Artistes",
          parentId: rootFolderId,
        });

      targetFolderId =
        await getOrCreateDriveFolder({
          drive,
          name: artistName,
          parentId:
            artistsFolderId,
        });
    }

    if (projectName) {
      const projectsFolderId =
        await getOrCreateDriveFolder({
          drive,
          name: "Projets",
          parentId: artistName
            ? targetFolderId
            : rootFolderId,
        });

      targetFolderId =
        await getOrCreateDriveFolder({
          drive,
          name: projectName,
          parentId:
            projectsFolderId,
        });
    }

    const categoryFolderNames:
      Record<string, string> = {
        Master: "Masters",
        Cover: "Covers",
        Clip: "Clips",
        "Photo presse":
          "Photos presse",
        EPK: "EPK",
        Contrat: "Contrats",
        "Document interne":
          "Documents internes",
        Autre: "Autres",
      };

    targetFolderId =
      await getOrCreateDriveFolder({
        drive,
        name:
          categoryFolderNames[
            categorie
          ] || "Autres",
        parentId:
          targetFolderId,
      });

    const {
      token: googleAccessToken,
    } =
      await oauth2Client.getAccessToken();

    if (!googleAccessToken) {
      throw new Error(
        "Token Google Drive indisponible."
      );
    }

    const googleResponse =
      await fetch(
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
            parents: [
              targetFolderId,
            ],
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
      googleResponse.headers.get(
        "location"
      );

    if (!uploadUrl) {
      throw new Error(
        "URL d’envoi Google Drive absente."
      );
    }

    return NextResponse.json({
      uploadUrl,
      folderId: targetFolderId,
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