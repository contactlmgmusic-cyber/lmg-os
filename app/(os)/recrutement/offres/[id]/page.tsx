import Link from "next/link";
import { notFound } from "next/navigation";

import CareersJobActions from "@/components/careers-admin/CareersJobActions";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

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
  project: "Mission / Projet",
};

const remoteLabels: Record<string, string> = {
  onsite: "Sur site",
  hybrid: "Hybride",
  remote: "Remote",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publiée",
  closed: "Clôturée",
  archived: "Archivée",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CareersJobPage({
  params,
}: PageProps) {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const { id } = await params;

  const supabase =
    await createAuthenticatedSupabaseClient();

  const { data: job, error } = await supabase
    .from("careers_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/recrutement/offres"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Retour aux offres
        </Link>
      </div>

      <div className="flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {departmentLabels[job.department] ??
                job.department}
            </p>

            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {statusLabels[job.status] ??
                job.status}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {job.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>
              {contractLabels[job.employment_type] ??
                job.employment_type}
            </span>

            {job.location && (
              <span>{job.location}</span>
            )}

            {job.remote_policy && (
              <span>
                {remoteLabels[job.remote_policy] ??
                  job.remote_policy}
              </span>
            )}
          </div>
        </div>

        <CareersJobActions
          id={job.id}
          status={job.status}
        />
      </div>

      {job.short_description && (
        <section className="max-w-3xl">
          <p className="text-lg leading-8 text-muted-foreground">
            {job.short_description}
          </p>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <Section
            title="À propos du poste"
            content={job.description}
          />

          <Section
            title="Missions"
            content={job.responsibilities}
          />

          <Section
            title="Profil recherché"
            content={job.profile}
          />

          <Section
            title="Ce que LMG propose"
            content={job.benefits}
          />
        </div>

        <aside className="h-fit rounded-xl border bg-card p-5">
          <h2 className="font-semibold">
            Informations
          </h2>

          <dl className="mt-5 space-y-5 text-sm">
            <Info
              label="Statut"
              value={
                statusLabels[job.status] ??
                job.status
              }
            />

            <Info
              label="Univers"
              value={
                departmentLabels[job.department] ??
                job.department
              }
            />

            <Info
              label="Contrat"
              value={
                contractLabels[
                  job.employment_type
                ] ?? job.employment_type
              }
            />

            {job.location && (
              <Info
                label="Localisation"
                value={job.location}
              />
            )}

            {job.application_email && (
              <Info
                label="Contact"
                value={job.application_email}
              />
            )}

            {job.published_at && (
              <Info
                label="Publication"
                value={new Intl.DateTimeFormat(
                  "fr-FR",
                  {
                    dateStyle: "medium",
                  }
                ).format(
                  new Date(job.published_at)
                )}
              />
            )}
          </dl>
        </aside>
      </div>
    </main>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  if (!content) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {content}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 font-medium">
        {value}
      </dd>
    </div>
  );
}
