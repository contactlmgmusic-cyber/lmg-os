import "server-only";

import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js";
import { drive_v3, google } from "googleapis";
import { createGoogleDriveOAuthClient } from "@/lib/google-drive.server";

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

export async function getCentralGoogleDrive(
  origin: string
) {
  const supabaseAdmin =
    createSupabaseAdmin();

  const { data: connection, error } =
    await supabaseAdmin
      .from("google_drive_connections")
      .select(
        "access_token, refresh_token, token_expiry, root_folder_id"
      )
      .eq("id", "lmg-central")
      .single();

  if (error || !connection) {
    throw new Error(
      "Le Drive central LMG n’est pas connecté."
    );
  }

  if (
    !connection.access_token ||
    !connection.refresh_token ||
    !connection.root_folder_id
  ) {
    throw new Error(
      "La connexion Google Drive est incomplète."
    );
  }

  const oauth2Client =
    createGoogleDriveOAuthClient(origin);

  oauth2Client.setCredentials({
    access_token:
      connection.access_token,
    refresh_token:
      connection.refresh_token,
    expiry_date:
      connection.token_expiry
        ? new Date(
            connection.token_expiry
          ).getTime()
        : undefined,
  });

  oauth2Client.on(
    "tokens",
    async (tokens) => {
      const update:
        Record<string, unknown> = {
          updated_at:
            new Date().toISOString(),
        };

      if (tokens.access_token) {
        update.access_token =
          tokens.access_token;
      }

      if (tokens.refresh_token) {
        update.refresh_token =
          tokens.refresh_token;
      }

      if (tokens.expiry_date) {
        update.token_expiry =
          new Date(
            tokens.expiry_date
          ).toISOString();
      }

      const { error: updateError } =
        await supabaseAdmin
          .from(
            "google_drive_connections"
          )
          .update(update)
          .eq("id", "lmg-central");

      if (updateError) {
        console.error(
          "Erreur mise à jour du token Drive :",
          updateError
        );
      }
    }
  );

  await oauth2Client.getAccessToken();

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  return {
    drive,
    oauth2Client,
    rootFolderId:
      connection.root_folder_id as string,
    supabaseAdmin,
  };
}

function cleanFolderName(
  value: string
) {
  return value
    .replace(/[\/\\]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function escapeDriveQuery(
  value: string
) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

export async function getOrCreateDriveFolder({
  drive,
  name,
  parentId,
}: {
  drive: drive_v3.Drive;
  name: string;
  parentId: string;
}) {
  const folderName =
    cleanFolderName(name);

  if (!folderName) {
    throw new Error(
      "Nom de dossier invalide."
    );
  }

  const escapedName =
    escapeDriveQuery(folderName);

  const escapedParent =
    escapeDriveQuery(parentId);

  const { data: result } =
    await drive.files.list({
      q: [
        `name = '${escapedName}'`,
        `mimeType = 'application/vnd.google-apps.folder'`,
        `'${escapedParent}' in parents`,
        "trashed = false",
      ].join(" and "),
      spaces: "drive",
      fields: "files(id,name)",
      pageSize: 1,
    });

  const existingFolderId =
    result.files?.[0]?.id;

  if (existingFolderId) {
    return existingFolderId;
  }

  const { data: folder } =
    await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType:
          "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
    });

  if (!folder.id) {
    throw new Error(
      `Impossible de créer le dossier ${folderName}.`
    );
  }

  return folder.id;
}

export async function assertDriveFolderInsideRoot({
  drive,
  folderId,
  rootFolderId,
}: {
  drive: drive_v3.Drive;
  folderId: string;
  rootFolderId: string;
}) {
  let currentFolderId: string | null =
    folderId;

  for (
    let depth = 0;
    depth < 20 && currentFolderId;
    depth += 1
  ) {
    if (currentFolderId === rootFolderId) {
      return;
    }

    const folderResponse =
      await drive.files.get({
        fileId: currentFolderId,
        fields:
          "id,mimeType,parents,trashed",
      });

    const folder: {
      trashed?: boolean | null;
      mimeType?: string | null;
      parents?: string[] | null;
    } = folderResponse.data;

    if (
      folder.trashed ||
      folder.mimeType !==
        "application/vnd.google-apps.folder"
    ) {
      break;
    }

    currentFolderId =
      folder.parents?.[0] || null;
  }

  throw new Error(
    "Le dossier de classement n’appartient pas au Drive central LMG."
  );
}

export async function getOrCreateBoundDriveFolder({
  drive,
  supabaseAdmin,
  entityType,
  entityId,
  bindingRole,
  name,
  parentId,
}: {
  drive: drive_v3.Drive;
  supabaseAdmin: SupabaseClient;
  entityType: "artist" | "project";
  entityId: string;
  bindingRole: string;
  name: string;
  parentId: string;
}) {
  const { data: binding } =
    await supabaseAdmin
      .from("google_drive_folder_bindings")
      .select("google_drive_folder_id")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .eq("folder_role", bindingRole)
      .maybeSingle();

  if (binding?.google_drive_folder_id) {
    try {
      const { data: folder } =
        await drive.files.get({
          fileId:
            binding.google_drive_folder_id,
          fields:
            "id,mimeType,parents,trashed",
        });

      if (
        !folder.trashed &&
        folder.mimeType ===
          "application/vnd.google-apps.folder" &&
        folder.parents?.includes(parentId)
      ) {
        return binding.google_drive_folder_id;
      }
    } catch {
      // Le dossier a pu être supprimé ou déplacé : on le résout à nouveau.
    }
  }

  const folderId =
    await getOrCreateDriveFolder({
      drive,
      name,
      parentId,
    });

  const { error: bindingError } =
    await supabaseAdmin
      .from("google_drive_folder_bindings")
      .upsert(
        {
          entity_type: entityType,
          entity_id: entityId,
          folder_role: bindingRole,
          google_drive_folder_id:
            folderId,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "entity_type,entity_id,folder_role",
        }
      );

  if (bindingError) {
    throw new Error(
      `Impossible d’enregistrer le dossier Drive : ${bindingError.message}`
    );
  }

  return folderId;
}
