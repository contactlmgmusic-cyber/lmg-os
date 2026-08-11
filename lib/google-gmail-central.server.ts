import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  createGoogleGmailApi,
  createGoogleGmailOAuthClient,
} from "@/lib/google-gmail.server";

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

export async function getCentralGoogleGmail(
  origin: string
) {
  const supabaseAdmin =
    createSupabaseAdmin();

  const {
    data: connection,
    error: connectionError,
  } = await supabaseAdmin
    .from("google_gmail_connections")
    .select(
      "access_token, refresh_token, token_expiry, google_email"
    )
    .eq("id", "lmg-central")
    .single();

  if (
    connectionError ||
    !connection ||
    !connection.refresh_token
  ) {
    throw new Error(
      "La boîte Gmail centrale LMG n’est pas connectée."
    );
  }

  const oauth2Client =
    createGoogleGmailOAuthClient(origin);

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
      const update: {
        access_token?: string;
        refresh_token?: string;
        token_expiry?: string;
        updated_at: string;
      } = {
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

      const { error } =
        await supabaseAdmin
          .from(
            "google_gmail_connections"
          )
          .update(update)
          .eq("id", "lmg-central");

      if (error) {
        console.error(
          "Erreur mise à jour du token Gmail :",
          error
        );
      }
    }
  );

  await oauth2Client.getAccessToken();

  const gmail =
    createGoogleGmailApi(
      oauth2Client
    );

  return {
    gmail,
    oauth2Client,
    googleEmail:
      connection.google_email,
    supabaseAdmin,
  };
}