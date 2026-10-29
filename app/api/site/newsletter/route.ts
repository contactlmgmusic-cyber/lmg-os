import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BREVO_DOI_ENDPOINT =
  "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function positiveInteger(value: string | undefined) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(request: Request) {
  const originHeader = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (!originHeader || originHeader !== requestOrigin) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }
  const originHostname = new URL(originHeader).hostname;
  const isMusicDomain = ["lmgmusic.fr", "www.lmgmusic.fr"].includes(originHostname);
  const isLocalDevelopment = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(originHostname);
  if (!isMusicDomain && !isLocalDevelopment) {
    return NextResponse.json({ error: "Origine invalide." }, { status: 403 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = positiveInteger(process.env.BREVO_NEWSLETTER_LIST_ID);
  const templateId = positiveInteger(process.env.BREVO_NEWSLETTER_TEMPLATE_ID);
  if (!apiKey || !listId || !templateId) {
    return NextResponse.json(
      { error: "La newsletter est temporairement indisponible." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Demande invalide." }, { status: 400 });
  }

  const values = payload as Record<string, unknown>;
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const consent = values.consent === true;
  const website = typeof values.website === "string" ? values.website : "";

  if (website || !consent || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Vérifiez votre adresse e-mail et votre consentement." }, { status: 400 });
  }

  const response = await fetch(BREVO_DOI_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      includeListIds: [listId],
      templateId,
      redirectionUrl: "https://www.lmgmusic.fr/newsletter/confirmation",
      contactPixelTrackingConsent: false,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Newsletter Brevo subscription failed", response.status, detail.slice(0, 300));
    return NextResponse.json(
      { error: "Impossible de finaliser l’inscription pour le moment." },
      { status: response.status === 400 ? 400 : 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
