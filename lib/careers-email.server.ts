import "server-only";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const sender = {
  name: "LMG Careers",
  email: "noreply@lmgmusic.fr",
};

type Recipient = { email: string; name?: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layout(content: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f3f1ec;color:#151515;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f1ec;padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #dedbd3"><tr><td style="padding:34px 36px 20px;font-size:12px;font-weight:700;letter-spacing:4px">LEGACY MUSIC GROUP</td></tr><tr><td style="padding:8px 36px 40px">${content}</td></tr><tr><td style="background:#151515;padding:24px 36px;color:#aaa;font-size:12px;line-height:1.6">LMG Careers · Build Your Legacy.<br>Cet e-mail a été envoyé automatiquement.</td></tr></table></td></tr></table></body></html>`;
}

async function sendEmail({
  to,
  subject,
  htmlContent,
  replyTo,
}: {
  to: Recipient[];
  subject: string;
  htmlContent: string;
  replyTo?: Recipient;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ sender, to, subject, htmlContent, replyTo }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo ${response.status}: ${detail.slice(0, 300)}`);
  }
}

export async function sendCandidateReceipt({
  email,
  firstName,
  opportunity,
  locale,
}: {
  email: string;
  firstName: string;
  opportunity: string;
  locale: "fr" | "en";
}) {
  const name = escapeHtml(firstName);
  const role = escapeHtml(opportunity);
  const english = locale === "en";

  await sendEmail({
    to: [{ email, name: firstName }],
    subject: english
      ? "We received your application — LMG Careers"
      : "Votre candidature a bien été reçue — LMG Careers",
    htmlContent: layout(`
      <p style="margin:0 0 12px;color:#b28b32;font-size:11px;font-weight:700;letter-spacing:2px">LMG CAREERS</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:38px;line-height:1.1">${english ? `Thank you, ${name}.` : `Merci, ${name}.`}</h1>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.7">${english ? `Your application for <strong>${role}</strong> has been received.` : `Votre candidature pour <strong>${role}</strong> a bien été reçue.`}</p>
      <p style="margin:0;color:#666;font-size:14px;line-height:1.7">${english ? "Our team will review your profile. If it matches the opportunity, we will contact you directly." : "Notre équipe va étudier votre profil. S’il correspond à l’opportunité, nous vous contacterons directement."}</p>
    `),
  });
}

export async function sendAdminApplicationAlert({
  recipients,
  candidateName,
  candidateEmail,
  opportunity,
  applicationId,
}: {
  recipients: Recipient[];
  candidateName: string;
  candidateEmail: string;
  opportunity: string;
  applicationId: string;
}) {
  if (!recipients.length) return;

  const name = escapeHtml(candidateName);
  const email = escapeHtml(candidateEmail);
  const role = escapeHtml(opportunity);
  const url = `https://os.lmgmusic.fr/recrutement/candidatures/${encodeURIComponent(applicationId)}`;

  const htmlContent = layout(`
      <p style="margin:0 0 12px;color:#b28b32;font-size:11px;font-weight:700;letter-spacing:2px">NOUVELLE CANDIDATURE</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:38px;line-height:1.1">${name}</h1>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6"><strong>Opportunité :</strong> ${role}</p>
      <p style="margin:0 0 28px;font-size:16px;line-height:1.6"><strong>E-mail :</strong> ${email}</p>
      <a href="${url}" style="display:inline-block;background:#151515;color:#fff;text-decoration:none;padding:15px 22px;font-size:12px;font-weight:700;letter-spacing:1px">OUVRIR LA CANDIDATURE</a>
    `);

  await Promise.all(recipients.map((recipient) => sendEmail({
    to: [recipient],
    replyTo: { email: candidateEmail, name: candidateName },
    subject: `Nouvelle candidature · ${opportunity}`,
    htmlContent,
  })));
}
