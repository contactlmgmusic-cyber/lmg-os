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

function encodeBase64Url(
  value: string
) {
  return Buffer.from(
    value,
    "utf8"
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeHeader(
  value: string
) {
  return `=?UTF-8?B?${Buffer.from(
    value,
    "utf8"
  ).toString("base64")}?=`;
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

export async function sendCentralGmail({
  origin,
  to,
  subject,
  message,
}: {
  origin: string;
  to: string;
  subject: string;
  message: string;
}) {
  const cleanTo = to.trim();
  const cleanSubject =
    subject.trim();
  const cleanMessage =
    message.trim();

  if (
    !cleanTo ||
    !cleanSubject ||
    !cleanMessage
  ) {
    throw new Error(
      "Le destinataire, l’objet et le message sont obligatoires."
    );
  }

  const { gmail } =
    await getCentralGoogleGmail(
      origin
    );

  const rawMessage = [
    "From: Legacy Music Group <contact@legacymusicgroup.fr>",
    "Reply-To: contact@legacymusicgroup.fr",
    `To: ${cleanTo}`,
    `Subject: ${encodeHeader(
      cleanSubject
    )}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(
      cleanMessage,
      "utf8"
    ).toString("base64"),
  ].join("\r\n");

  const response =
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeBase64Url(
          rawMessage
        ),
      },
    });

  return {
    gmailMessageId:
      response.data.id || null,
    gmailThreadId:
      response.data.threadId ||
      null,
  };
}