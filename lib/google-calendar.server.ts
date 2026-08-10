import "server-only";
import { google } from "googleapis";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
];

export function createGoogleCalendarOAuthClient(
  redirectUri: string
) {
  const clientId =
    process.env.GOOGLE_CALENDAR_CLIENT_ID;

  const clientSecret =
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Identifiants Google Calendar manquants."
    );
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}

export function createGoogleCalendarApi(
  auth: ReturnType<
    typeof createGoogleCalendarOAuthClient
  >
) {
  return google.calendar({
    version: "v3",
    auth,
  });
}