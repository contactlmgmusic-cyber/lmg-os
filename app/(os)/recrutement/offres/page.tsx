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
    <main className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            LMG Careers
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Offres
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Gérez les opportunités publiées sur LMG Careers.
          </p>
        </div>

        <Link
          href="/recrutement/offres/nouvelle"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-400 px-5 text-sm font-semibold text-black transition hover:bg-amber-300"
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
        <div className="rounded-2xl border border-white/10 bg-zinc-950 px-6 py-16 text-center text-white">
          <h2 className="text-lg font-semibold">
            Aucune offre pour le moment
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Créez votre première opportunité Careers. Vous pourrez
            l&apos;enregistrer en brouillon avant sa publication.
          </p>

          <Link
            href="/recrutement/offres/nouvelle"
            className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black"
          >
            Créer une offre
          </Link>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white">
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              href={`/recrutement/offres/${job.id}`}
              className={`grid gap-5 p-5 transition hover:bg-white/[0.035] md:grid-cols-[1fr_auto] md:items-center ${
                index !== jobs.length - 1
                  ? "border-b border-white/10"
                  : ""
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-amber-400">
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
                <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
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
