import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/service-supabase.server";
import { careersSubmissionsReady } from "@/lib/careers-identity.server";
import { readLimitedFormData, PayloadTooLarge } from "@/lib/limited-form-data";
import { MAX_CV_SIZE, validateApplication, validateCv } from "@/lib/careers-validation";
import { sendAdminApplicationAlert, sendCandidateReceipt } from "@/lib/careers-email.server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const id = randomUUID();
  const failure = (status: number, message: string) => NextResponse.json({ error: message, reference: id }, { status });
  if (!careersSubmissionsReady()) return failure(503, "Les candidatures sont temporairement indisponibles.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origine de la demande invalide.");
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_CV_SIZE + 128 * 1024) return failure(413, "Le fichier est trop volumineux.");
  let cvPath: string | null = null;
  let db: ReturnType<typeof createServiceSupabaseClient> | null = null;
  try {
    db = createServiceSupabaseClient();
    // Vercel supplies x-real-ip. Fail closed if a trusted client address is unavailable.
    const ip = request.headers.get("x-real-ip");
    if (!ip || !process.env.CAREERS_RATE_LIMIT_SECRET) return failure(503, "Les candidatures sont temporairement indisponibles.");
    const key = createHmac("sha256", process.env.CAREERS_RATE_LIMIT_SECRET).update(ip).digest("hex");
    const { data: allowed, error: limitError } = await db.rpc("consume_careers_submission_quota", { client_key: key });
    if (limitError) throw limitError;
    if (!allowed) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une heure." }, { status: 429, headers: { "Retry-After": "3600" } });
    const form = await readLimitedFormData(request, MAX_CV_SIZE + 128 * 1024);
    if (form.get("website")) return failure(400, "Demande invalide.");
    let fields: ReturnType<typeof validateApplication>, extension: string;
    const cv = form.get("cv");
    try {
      fields = validateApplication(form);
      if (!(cv instanceof File)) throw new Error("Missing CV");
      extension = await validateCv(cv);
    } catch { return failure(400, "Vérifiez les champs et votre CV (PDF, DOC ou DOCX, 4 Mo maximum)."); }
    let jobId: string | null = null;
    let opportunity = fields.locale === "en" ? "Open application" : "Candidature spontanée";
    if (fields.application_type === "job") {
      const { data: job, error } = await db.from("careers_jobs").select("id, title, published_at, closes_at").eq("slug", fields.job_slug!).eq("status", "published").maybeSingle();
      if (error) throw error;
      const now = Date.now();
      if (!job || (job.published_at && Date.parse(job.published_at) > now) || (job.closes_at && Date.parse(job.closes_at) <= now)) return failure(404, "Cette offre n’est plus disponible.");
      jobId = job.id;
      opportunity = job.title;
    }

    const duplicateCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let duplicateQuery = db
      .from("careers_applications")
      .select("id")
      .ilike("email", fields.email)
      .eq("application_type", fields.application_type)
      .gte("created_at", duplicateCutoff)
      .limit(1);
    duplicateQuery = jobId
      ? duplicateQuery.eq("job_id", jobId)
      : duplicateQuery.is("job_id", null);
    const { data: duplicate, error: duplicateError } = await duplicateQuery.maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) {
      return failure(409, "Une candidature identique a déjà été reçue durant les dernières 24 heures.");
    }

    cvPath = `applications/${randomUUID()}/cv.${extension}`;
    const { error: uploadError } = await db.storage.from("careers-cv").upload(cvPath, cv as File, { contentType: (cv as File).type, upsert: false });
    if (uploadError) throw uploadError;
    const { job_slug: _slug, locale, ...application } = fields;
    void _slug;
    const { data: savedApplication, error } = await db
      .from("careers_applications")
      .insert({ ...application, job_id: jobId, cv_url: cvPath, status: "new", internal_notes: null })
      .select("id")
      .single();
    if (error) throw error;

    const { data: admins, error: adminsError } = await db
      .from("profiles")
      .select("id, email, nom")
      .in("role", ["super_admin", "admin"]);
    if (adminsError) {
      console.error("Careers admins lookup failed", id, adminsError.message);
    }

    const adminProfiles = admins || [];
    const emailRecipients = adminProfiles.filter((admin) => admin.email);
    if (adminProfiles.length) {
      const notificationLink = `/recrutement/candidatures/${savedApplication.id}`;
      const { error: notificationError } = await db.from("notifications").insert(
        adminProfiles.map((admin) => ({
          user_id: admin.id,
          type: "Recrutement",
          titre: "Nouvelle candidature",
          description: `${fields.first_name} ${fields.last_name} · ${opportunity}`,
          link: notificationLink,
          lien: notificationLink,
          niveau: "Important",
          lu: false,
          is_read: false,
        }))
      );
      if (notificationError) {
        console.error("Careers notification failed", id, notificationError.message);
      }
    }

    const emailResults = await Promise.allSettled([
      sendCandidateReceipt({
        email: fields.email,
        firstName: fields.first_name!,
        opportunity,
        locale,
      }),
      sendAdminApplicationAlert({
        recipients: emailRecipients.map((admin) => ({ email: admin.email!, name: admin.nom || undefined })),
        candidateName: `${fields.first_name} ${fields.last_name}`,
        candidateEmail: fields.email,
        opportunity,
        applicationId: savedApplication.id,
      }),
    ]);
    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("Careers email failed", id, index === 0 ? "candidate" : "admins", result.reason);
      }
    });

    return NextResponse.json({ ok: true, applicationType: fields.application_type });
  } catch (error) {
    if (error instanceof PayloadTooLarge) return failure(413, "Le fichier est trop volumineux.");
    console.error("Careers submission failed", id, error instanceof Error ? error.message : error);
    if (db && cvPath) {
      const { error: cleanupError } = await db.storage.from("careers-cv").remove([cvPath]);
      if (cleanupError) console.error("Careers CV cleanup failed", id, cvPath, cleanupError.message);
    }
    return failure(500, "Impossible d’envoyer votre candidature. Réessayez plus tard.");
  }
}
