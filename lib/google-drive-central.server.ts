import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  createGoogleDriveOAuthClient,
} from "@/lib/google-drive.server";
import { google } from "googleapis";

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
  const supabaseAdmin = createSupabaseAdmin();

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
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    expiry_date: connection.token_expiry
      ? new Date(
          connection.token_expiry
        ).getTime()
      : undefined,
  });

  oauth2Client.on(
    "tokens",
    async (tokens) => {
      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
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
          .from("google_drive_connections")
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