import Link from "next/link";

import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

const modules = [
  {
    title: "Offres",
    description:
      "Créer, publier, modifier et clôturer les opportunités visibles sur LMG Careers.",
    href: "/recrutement/offres",
    label: "Gérer les offres",
  },
  {
    title: "Candidatures",
    description:
      "Consulter et suivre les candidatures reçues pour les offres publiées.",
    href: "/recrutement/candidatures",
    label: "Voir les candidatures",
  },
  {
    title: "Spontanées",
    description:
      "Retrouver les profils ayant choisi de se présenter directement à LMG.",
    href: "/recrutement/spontanees",
    label: "Voir les profils",
  },
];

export default async function CareersAdminPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const supabase = await createAuthenticatedSupabaseClient();

  const [
    activeJobsResult,
    newApplicationsResult,
    interviewsResult,
  ] = await Promise.all([
    supabase
      .from("careers_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),

    supabase
      .from("careers_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),

    supabase
      .from("careers_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "interview"),
  ]);

  const errors = [
    activeJobsResult.error,
    newApplicationsResult.error,
    interviewsResult.error,
  ].filter(Boolean);

  const stats = [
    {
      label: "Offres actives",
      value: activeJobsResult.count ?? 0,
    },
    {
      label: "Nouvelles candidatures",
      value: newApplicationsResult.count ?? 0,
    },
    {
      label: "Entretiens",
      value: interviewsResult.count ?? 0,
    },
  ];

  return (
    <main className="space-y-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            LMG Careers
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Careers
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Gérez les opportunités et les candidatures reçues depuis
            careers.lmgmusic.fr.
          </p>
        </div>

        <Link
          href="/recrutement/offres/nouvelle"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Nouvelle offre
        </Link>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          Certaines données Careers n&apos;ont pas pu être chargées.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group flex min-h-[220px] flex-col justify-between rounded-xl border bg-card p-6 transition hover:border-foreground/30"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {module.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
            </div>

            <span className="mt-8 text-sm font-medium">
              {module.label} →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
