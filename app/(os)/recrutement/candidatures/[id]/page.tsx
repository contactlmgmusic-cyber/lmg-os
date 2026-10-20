import Link from "next/link";
import { notFound } from "next/navigation";

import CareersApplicationManager from "@/components/careers-admin/CareersApplicationManager";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

const departmentLabels: Record<string, string> = {
  music: "Music",
  creative: "Creative",
  business: "Business",
  tech_digital: "Tech & Digital",
};

const contractLabels: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  alternance: "Alternance",
  freelance: "Freelance",
  project: "Projet",
};

export default async function ApplicationPage({
  params,
}: PageProps) {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const { id } = await params;

  const supabase =
    await createAuthenticatedSupabaseClient();

  const { data: application, error } =
    await supabase
      .from("careers_applications")
      .select(`
        *,
        careers_jobs (
          id,
          title,
          slug,
          department,
          employment_type,
          location
        )
      `)
      .eq("id", id)
      .single();

  if (error || !application) {
    notFound();
  }

  const [{ data: rawEvents }, { data: rawNotes }, { data: staff }, interviewResult] = await Promise.all([
    supabase
      .from("careers_application_events")
      .select("id, event_type, from_status, to_status, actor_id, details, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("careers_application_notes")
      .select("id, body, author_id, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, nom, email, role")
      .in("role", ["super_admin", "admin", "manager", "artistic_director"])
      .order("nom"),
    application.interview_event_id
      ? supabase
          .from("internal_events")
          .select("id, date_debut, date_fin, lieu, lien_visio, participant_ids, reminder_minutes")
          .eq("id", application.interview_event_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const peopleIds = Array.from(new Set([
    ...(rawEvents || []).map((item) => item.actor_id),
    ...(rawNotes || []).map((item) => item.author_id),
  ].filter(Boolean))) as string[];

  const { data: people } = peopleIds.length
    ? await supabase.from("profiles").select("id, nom, email").in("id", peopleIds)
    : { data: [] };
  const peopleById = new Map((people || []).map((person) => [person.id, person.nom || person.email]));
  const events = (rawEvents || []).map((item) => ({ ...item, actor_name: item.actor_id ? peopleById.get(item.actor_id) || null : null }));
  const notes = (rawNotes || []).map((item) => ({ ...item, author_name: peopleById.get(item.author_id) || null }));

  const job = Array.isArray(
    application.careers_jobs
  )
    ? application.careers_jobs[0]
    : application.careers_jobs;

  let cvUrl: string | null = null;

  if (application.cv_url) {
    const { data } = await supabase.storage
      .from("careers-cv")
      .createSignedUrl(
        application.cv_url,
        60 * 15
      );

    cvUrl = data?.signedUrl ?? null;
  }

  return (
    <main className="space-y-6 pb-10">
      <div>
        <Link
          href="/recrutement/candidatures"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Candidatures
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Dossier candidat
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {application.first_name}{" "}
            {application.last_name}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Reçue le{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(
              new Date(application.created_at)
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Offre
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {job?.title ?? "Offre indisponible"}
            </h2>

            {job && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Meta>{departmentLabels[job.department] ?? job.department}</Meta>

                <Meta>
                  {contractLabels[
                    job.employment_type
                  ] ?? job.employment_type}
                </Meta>

                {job.location && (
                  <Meta>{job.location}</Meta>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vivier LMG
            </p>

            <p className={`mt-3 text-sm font-medium ${application.talent_pool_consent ? "text-emerald-500" : "text-muted-foreground"}`}>
              {application.talent_pool_consent ? "Conservation autorisée" : "Conservation non autorisée"}
            </p>

            {application.talent_pool_consented_at && (
              <p className="mt-2 text-sm text-muted-foreground">
                Accord donné le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(application.talent_pool_consented_at))}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Coordonnées
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Info
                label="Email"
                value={application.email}
              />

              <Info
                label="Téléphone"
                value={application.phone}
              />

              <Info
                label="Localisation"
                value={application.location}
              />

              <Info
                label="Disponibilité"
                value={application.availability}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profil
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {application.linkedin_url && (
                <a
                  href={application.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:border-amber-400/30"
                >
                  LinkedIn ↗
                </a>
              )}

              {application.portfolio_url && (
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:border-amber-400/30"
                >
                  Portfolio ↗
                </a>
              )}

              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black"
                >
                  Ouvrir le CV ↗
                </a>
              )}
            </div>
          </section>

          {application.cover_letter && (
            <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Message du candidat
              </p>

              <p className="mt-6 whitespace-pre-line text-sm leading-7">
                {application.cover_letter}
              </p>
            </section>
          )}
        </div>

        <aside>
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
            <h2 className="text-lg font-semibold">
              Suivi de candidature
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Statut et informations réservées à
              l&apos;équipe LMG.
            </p>

            <div className="mt-7">
              <CareersApplicationManager
                id={application.id}
                initialStatus={application.status}
                legacyNotes={application.internal_notes}
                events={events}
                notes={notes}
                staff={(staff || []).map((person) => ({
                  id: person.id,
                  name: person.nom || person.email || "Membre LMG",
                }))}
                initialAssignee={application.assigned_to}
                initialNextAction={application.next_action}
                initialNextActionAt={application.next_action_at}
                initialInterview={interviewResult.data}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Meta({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
      {children}
    </span>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}
