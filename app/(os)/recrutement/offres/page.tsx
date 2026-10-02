import Link from "next/link";

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

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publiée",
  closed: "Clôturée",
  archived: "Archivée",
};

export default async function CareersJobsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const supabase =
    await createAuthenticatedSupabaseClient();

  const { data: jobs, error } = await supabase
    .from("careers_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            LMG Careers
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Offres
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Gérez les opportunités publiées sur LMG Careers.
          </p>
        </div>

        <Link
          href="/recrutement/offres/nouvelle"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background"
        >
          Nouvelle offre
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          Impossible de charger les offres : {error.message}
        </div>
      )}

      {!error && (!jobs || jobs.length === 0) && (
        <div className="rounded-xl border bg-card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">
            Aucune offre pour le moment
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Créez votre première opportunité Careers. Vous pourrez
            l&apos;enregistrer en brouillon avant sa publication.
          </p>

          <Link
            href="/recrutement/offres/nouvelle"
            className="mt-6 inline-flex rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Créer une offre
          </Link>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              href={`/recrutement/offres/${job.id}`}
              className={`grid gap-5 p-5 transition hover:bg-muted/40 md:grid-cols-[1fr_auto] md:items-center ${
                index !== jobs.length - 1
                  ? "border-b"
                  : ""
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {departmentLabels[job.department] ??
                      job.department}
                  </span>

                  <span className="text-muted-foreground">
                    ·
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {contractLabels[job.employment_type] ??
                      job.employment_type}
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-semibold">
                  {job.title}
                </h2>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {job.location && (
                    <span>{job.location}</span>
                  )}

                  <span>
                    {statusLabels[job.status] ?? job.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium">
                  {statusLabels[job.status] ?? job.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
