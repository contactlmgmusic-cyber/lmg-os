import "server-only";

import { randomUUID } from "crypto";
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

function encodeMimePart(
  value: string
) {
  return Buffer.from(
    value,
    "utf8"
  ).toString("base64");
}

function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPlainTextEmail(
  message: string
) {
  return `${message}

--
Joseph Kayaya
Founder & CEO
Legacy Music Group
Artist Management • Artist Development • Booking • Marketing
Building legacies, not moments.

contact@legacymusicgroup.fr
https://www.legacymusicgroup.fr
https://www.instagram.com/legacymusic.group/`;
}

function createHtmlEmail(
  message: string
) {
  const formattedMessage =
    escapeHtml(message).replace(
      /\r?\n/g,
      "<br>"
    );

  return `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    >
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #111111;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div
      style="
        font-size: 16px;
        line-height: 1.6;
        color: #111111;
      "
    >
      ${formattedMessage}
    </div>

    <div
      style="
        margin-top: 34px;
        padding-top: 8px;
        max-width: 760px;
        font-family: Arial, Helvetica, sans-serif;
      "
    >
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width: 100%;
          max-width: 760px;
          border-collapse: collapse;
        "
      >
        <tr>
          <td
            style="
              width: 180px;
              padding: 0 30px 0 0;
              vertical-align: top;
              text-align: center;
            "
          >
            <a
              href="https://www.legacymusicgroup.fr"
              target="_blank"
              style="
                text-decoration: none;
              "
            >
              <img
                src="https://www.legacymusicgroup.fr/icon.png"
                alt="Legacy Music Group"
                width="145"
                height="145"
                style="
                  display: block;
                  width: 145px;
                  height: 145px;
                  margin: 0 auto;
                  border: 0;
                  border-radius: 50%;
                  object-fit: contain;
                "
              >
            </a>

            <div
              style="
                margin-top: 22px;
              "
            >
              <a
                href="https://www.instagram.com/legacymusic.group/"
                target="_blank"
                aria-label="Instagram Legacy Music Group"
                style="
                  display: inline-block;
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  background-color: #000000;
                  color: #ffffff;
                  font-size: 18px;
                  line-height: 38px;
                  text-align: center;
                  text-decoration: none;
                "
              >
                ◎
              </a>
            </div>
          </td>

          <td
            style="
              padding: 0;
              vertical-align: top;
              color: #111111;
            "
          >
            <p
              style="
                margin: 0;
                font-size: 25px;
                line-height: 1.25;
                font-weight: 700;
                color: #111111;
              "
            >
              Joseph Kayaya
            </p>

            <p
              style="
                margin: 8px 0 0;
                font-size: 18px;
                line-height: 1.4;
                color: #111111;
              "
            >
              Founder &amp; CEO
            </p>

            <p
              style="
                margin: 3px 0 0;
                font-size: 18px;
                line-height: 1.4;
                color: #111111;
              "
            >
              Legacy Music Group
            </p>

            <p
              style="
                margin: 3px 0 0;
                font-size: 16px;
                line-height: 1.5;
                color: #111111;
              "
            >
              Artist Management • Artist Development • Booking • Marketing
            </p>

            <p
              style="
                margin: 7px 0 0;
                font-size: 17px;
                line-height: 1.4;
                font-style: italic;
                color: #111111;
              "
            >
              Building legacies, not moments.
            </p>

            <div
              style="
                height: 1px;
                margin: 26px 0 20px;
                background-color: #d4a91f;
              "
            ></div>

            <p
              style="
                margin: 0 0 9px;
                font-size: 16px;
                line-height: 1.5;
                color: #111111;
              "
            >
              <span
                style="
                  display: inline-block;
                  width: 27px;
                  color: #d4a91f;
                  font-size: 19px;
                "
              >
                ✉
              </span>

              <a
                href="mailto:contact@legacymusicgroup.fr"
                style="
                  color: #111111;
                  text-decoration: none;
                "
              >
                contact@legacymusicgroup.fr
              </a>
            </p>

            <p
              style="
                margin: 0;
                font-size: 16px;
                line-height: 1.5;
                color: #111111;
              "
            >
              <span
                style="
                  display: inline-block;
                  width: 27px;
                  color: #d4a91f;
                  font-size: 19px;
                "
              >
                ◉
              </span>

              <a
                href="https://www.legacymusicgroup.fr"
                target="_blank"
                style="
                  color: #111111;
                  text-decoration: none;
                "
              >
                www.legacymusicgroup.fr
              </a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
  `.trim();
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

  const boundary =
    `lmg-${randomUUID()}`;

  const plainTextEmail =
    createPlainTextEmail(
      cleanMessage
    );

  const htmlEmail =
    createHtmlEmail(
      cleanMessage
    );

  const rawMessage = [
    "From: Legacy Music Group <contact@legacymusicgroup.fr>",
    "Reply-To: contact@legacymusicgroup.fr",
    `To: ${cleanTo}`,
    `Subject: ${encodeHeader(
      cleanSubject
    )}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeMimePart(
      plainTextEmail
    ),
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeMimePart(
      htmlEmail
    ),
    "",
    `--${boundary}--`,
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