import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCentralGoogleDrive } from "@/lib/google-drive-central.server";
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
            "Tu n’as pas l’autorisation d’ajouter ce fichier.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const googleDriveFileId =
      typeof body.googleDriveFileId ===
        "string"
        ? body.googleDriveFileId.trim()
        : "";

    const nom =
      typeof body.nom === "string"
        ? body.nom.trim()
        : "";

    const categorie =
      typeof body.categorie ===
        "string"
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

    if (!googleDriveFileId) {
      return NextResponse.json(
        {
          error:
            "Identifiants Google Drive manquants.",
        },
        { status: 400 }
      );
    }

    if (
      !allowedCategories.includes(
        categorie
      )
    ) {
      return NextResponse.json(
        { error: "Catégorie invalide." },
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
      rootFolderId,
    } =
      await getCentralGoogleDrive(
        request.nextUrl.origin
      );

    const { data: googleFile } =
      await drive.files.get({
        fileId:
          googleDriveFileId,
        fields:
          "id,name,mimeType,size,parents,trashed",
      });

      const folderId =
  googleFile.parents?.[0] || null;

    if (
  googleFile.trashed ||
  !folderId
) {
      return NextResponse.json(
        {
          error:
            "Le fichier n’appartient pas au dossier attendu.",
        },
        { status: 403 }
      );
    }

    let currentFolderId:
      | string
      | null = folderId;

    let folderInsideRoot = false;

    for (
      let depth = 0;
      depth < 20 && currentFolderId;
      depth += 1
    ) {
      if (
        currentFolderId ===
        rootFolderId
      ) {
        folderInsideRoot = true;
        break;
      }

      const folderResponse =
  await drive.files.get({
    fileId:
      currentFolderId,
    fields:
      "id,mimeType,parents,trashed",
  });

const folderData:
  {
    trashed?: boolean | null;
    mimeType?: string | null;
    parents?: string[] | null;
  } = folderResponse.data;

if (
  folderData.trashed ||
  folderData.mimeType !==
    "application/vnd.google-apps.folder"
) {
  break;
}

currentFolderId =
  folderData.parents?.[0] || null;
    }

    if (!folderInsideRoot) {
      return NextResponse.json(
        {
          error:
            "Le dossier n’appartient pas au Drive central LMG.",
        },
        { status: 403 }
      );
    }

    const {
      data: savedFile,
      error: saveError,
    } = await supabaseAdmin
      .from("drive_files")
      .insert({
        nom:
          nom ||
          googleFile.name ||
          "Fichier",
        type:
          googleFile.mimeType ||
          null,
        categorie,
        artiste_id: artisteId,
        projet_id: projetId,
        fichier_url:
          `/api/google-drive/files/${googleDriveFileId}`,
        taille: Number(
          googleFile.size || 0
        ),
        uploaded_by: user.id,
        storage_provider:
          "google_drive",
        google_drive_file_id:
          googleDriveFileId,
        google_drive_folder_id:
          folderId,
      })
      .select(`
        *,
        artistes ( id, nom ),
        projets ( id, titre )
      `)
      .single();

    if (saveError) {
      console.error(
        "Erreur enregistrement fichier Drive :",
        saveError
      );

      try {
        await drive.files.delete({
          fileId:
            googleDriveFileId,
        });
      } catch (deleteError) {
        console.error(
          "Impossible de supprimer le fichier orphelin :",
          deleteError
        );
      }

      return NextResponse.json(
        {
          error:
            `Erreur Supabase ${saveError.code}: ${saveError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      file: savedFile,
    });
  } catch (error) {
    console.error(
      "Erreur finalisation upload Drive :",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de finaliser l’upload.",
      },
      { status: 500 }
    );
  }
}