import "server-only";
import { google } from "googleapis";

export const GOOGLE_GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
];

export function createGoogleGmailOAuthClient(
  origin: string
) {
  const clientId =
    process.env.GOOGLE_CALENDAR_CLIENT_ID;

  const clientSecret =
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Identifiants Google OAuth manquants."
    );
  }

  const redirectUri =
    `${origin}/api/google-gmail/callback`;

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}

export function getGoogleGmailAuthUrl({
  origin,
  state,
}: {
  origin: string;
  state: string;
}) {
  const oauth2Client =
    createGoogleGmailOAuthClient(origin);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_GMAIL_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export function createGoogleGmailApi(
  oauth2Client: ReturnType<
    typeof createGoogleGmailOAuthClient
  >
) {
  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}