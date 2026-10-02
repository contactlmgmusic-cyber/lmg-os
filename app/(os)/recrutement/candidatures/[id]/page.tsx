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
    <main className="space-y-8">
      <div>
        <Link
          href="/recrutement/candidatures"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Candidatures
        </Link>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Candidature
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {application.first_name}{" "}
            {application.last_name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
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
          <section className="rounded-2xl border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Offre
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {job?.title ?? "Offre indisponible"}
            </h2>

            {job && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Meta>
                  {departmentLabels[
                    job.department
                  ] ?? job.department}
                </Meta>

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

          <section className="rounded-2xl border bg-card p-6">
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

          <section className="rounded-2xl border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profil
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {application.linkedin_url && (
                <a
                  href={application.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border px-4 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  LinkedIn ↗
                </a>
              )}

              {application.portfolio_url && (
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border px-4 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  Portfolio ↗
                </a>
              )}

              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                >
                  Ouvrir le CV ↗
                </a>
              )}
            </div>
          </section>

          {application.cover_letter && (
            <section className="rounded-2xl border bg-card p-6">
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
          <div className="sticky top-6 rounded-2xl border bg-card p-6">
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
                initialNotes={
                  application.internal_notes
                }
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
    <span className="rounded-full bg-muted px-3 py-1.5 text-xs">
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
