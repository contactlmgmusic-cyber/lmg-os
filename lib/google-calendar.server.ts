import "server-only";
import { google } from "googleapis";
import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "crypto";

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
  throw new Error("Configuration Google Calendar indisponible.");
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

type GoogleOAuthState = {
  userId: string;
  nonce: string;
  expiresAt: number;
};

function getStateSecret() {
  const secret =
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!secret) {
    throw new Error(
      "Secret Google Calendar manquant."
    );
  }

  return secret;
}

export function createSignedGoogleOAuthState(
  userId: string
) {
  const payload: GoogleOAuthState = {
    userId,
    nonce: randomUUID(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = createHmac(
    "sha256",
    getStateSecret()
  )
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySignedGoogleOAuthState(
  state: string
): GoogleOAuthState | null {
  const [encodedPayload, receivedSignature] =
    state.split(".");

  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = createHmac(
    "sha256",
    getStateSecret()
  )
    .update(encodedPayload)
    .digest("base64url");

  const receivedBuffer = Buffer.from(
    receivedSignature
  );

  const expectedBuffer = Buffer.from(
    expectedSignature
  );

  if (
    receivedBuffer.length !==
      expectedBuffer.length ||
    !timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    )
  ) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(
      encodedPayload,
      "base64url"
    ).toString("utf8")
  ) as GoogleOAuthState;

  if (
    !payload.userId ||
    payload.expiresAt < Date.now()
  ) {
    return null;
  }

  return payload;
}