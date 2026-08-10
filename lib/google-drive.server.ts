import { google } from "googleapis";

export const GOOGLE_DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

export function createGoogleDriveOAuthClient(origin: string) {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Configuration Google Drive indisponible.");
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${origin}/api/google-drive/callback`
  );
}

export function getGoogleDriveAuthUrl({
  origin,
  state,
}: {
  origin: string;
  state: string;
}) {
  const oauth2Client = createGoogleDriveOAuthClient(origin);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_DRIVE_SCOPES,
    state,
  });
}

export async function getGoogleDriveClient({
  origin,
  accessToken,
  refreshToken,
  tokenExpiry,
}: {
  origin: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiry?: string | null;
}) {
  const oauth2Client = createGoogleDriveOAuthClient(origin);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expiry_date: tokenExpiry
      ? new Date(tokenExpiry).getTime()
      : undefined,
  });

  return {
    oauth2Client,
    drive: google.drive({
      version: "v3",
      auth: oauth2Client,
    }),
  };
}