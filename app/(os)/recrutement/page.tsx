import Link from "next/link";

import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  new: "Nouvelle",
  review: "À étudier",
  interview: "Entretien",
  selected: "Retenue",
  rejected: "Refusée",
  talent_pool: "Vivier",
};

const statusClasses: Record<string, string> = {
  new: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  review: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  interview: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  selected: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  talent_pool: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
};

export default async function CareersAdminPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  const supabase = await createAuthenticatedSupabaseClient();
  const [
    activeJobsResult,
    newApplicationsResult,
    interviewsResult,
    totalApplicationsResult,
    recentApplicationsResult,
    overdueActionsResult,
    upcomingActionsResult,
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
    supabase
      .from("careers_applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("careers_applications")
      .select(`
        id,
        first_name,
        last_name,
        application_type,
        status,
        created_at,
        careers_jobs (title)
      `)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("careers_applications")
      .select("id", { count: "exact", head: true })
      .lt("next_action_at", new Date().toISOString())
      .not("status", "in", '(selected,rejected)'),
    supabase
      .from("careers_applications")
      .select("id, first_name, last_name, next_action, next_action_at")
      .gte("next_action_at", new Date().toISOString())
      .order("next_action_at", { ascending: true })
      .limit(4),
  ]);

  const errors = [
    activeJobsResult.error,
    newApplicationsResult.error,
    interviewsResult.error,
    totalApplicationsResult.error,
    recentApplicationsResult.error,
    overdueActionsResult.error,
    upcomingActionsResult.error,
  ].filter(Boolean);

  const stats = [
    {
      label: "Offres actives",
      value: activeJobsResult.count ?? 0,
      detail: "publiées actuellement",
      icon: "briefcase" as const,
    },
    {
      label: "À traiter",
      value: newApplicationsResult.count ?? 0,
      detail: "nouvelles candidatures",
      icon: "clock" as const,
    },
    {
      label: "Entretiens",
      value: interviewsResult.count ?? 0,
      detail: "profils en entretien",
      icon: "check" as const,
    },
    {
      label: "Profils reçus",
      value: totalApplicationsResult.count ?? 0,
      detail: "depuis le lancement",
      icon: "users" as const,
    },
    {
      label: "Actions en retard",
      value: overdueActionsResult.count ?? 0,
      detail: "échéances dépassées",
      icon: "clock" as const,
    },
  ];

  const recentApplications = recentApplicationsResult.data ?? [];

  return (
    <main className="space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              LMG Careers
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Centre de recrutement
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Pilotez les opportunités et suivez les profils reçus depuis
              careers.lmgmusic.fr.
            </p>
          </div>

          <Link
            href="/recrutement/offres/nouvelle"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle offre
          </Link>
        </div>
      </header>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
          Certaines données Careers n&apos;ont pas pu être chargées.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                  <DashboardIcon name={stat.icon} />
                </span>
              </div>
              <p className="mt-4 text-xs text-zinc-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Candidatures récentes</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Les derniers profils reçus par LMG
              </p>
            </div>
            <Link
              href="/recrutement/candidatures"
              className="text-xs font-medium text-amber-400 transition hover:text-amber-300"
            >
              Tout afficher
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <FileIcon className="mx-auto h-7 w-7 text-zinc-600" />
              <p className="mt-3 text-sm font-medium">Aucun profil reçu</p>
              <p className="mt-1 text-xs text-zinc-500">
                Les prochaines candidatures apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentApplications.map((application) => {
                const job = Array.isArray(application.careers_jobs)
                  ? application.careers_jobs[0]
                  : application.careers_jobs;
                const opportunity =
                  application.application_type === "spontaneous"
                    ? "Candidature spontanée"
                    : job?.title ?? "Offre supprimée";

                return (
                  <Link
                    key={application.id}
                    href={`/recrutement/candidatures/${application.id}`}
                    className="group grid gap-3 px-5 py-4 transition hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {application.first_name} {application.last_name}
                      </p>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {opportunity}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        statusClasses[application.status] ??
                        "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      {statusLabels[application.status] ?? application.status}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{formatDate(application.created_at)}</span>
                      <ArrowIcon className="h-4 w-4 transition group-hover:text-amber-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
            Accès rapide
          </p>
          <div className="mt-5 space-y-2">
            <QuickLink
              href="/recrutement/offres"
              title="Offres"
              detail="Créer et piloter les opportunités"
            />
            <QuickLink
              href="/recrutement/candidatures"
              title="Candidatures"
              detail="Profils reçus pour une offre"
            />
            <QuickLink
              href="/recrutement/spontanees"
              title="Spontanées"
              detail="Talents ayant contacté LMG"
            />
          </div>

          <div className="mt-6 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
            <p className="text-sm font-medium">Priorité du jour</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              {newApplicationsResult.count
                ? `${newApplicationsResult.count} candidature${
                    newApplicationsResult.count > 1 ? "s" : ""
                  } à examiner.`
                : "Toutes les nouvelles candidatures ont été traitées."}
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Prochaines échéances</p>
            <div className="mt-3 space-y-2">
              {(upcomingActionsResult.data || []).map((item) => (
                <Link key={item.id} href={`/recrutement/candidatures/${item.id}`} className="block rounded-xl bg-white/[0.035] p-3 transition hover:bg-white/[0.06]">
                  <p className="truncate text-xs font-medium">{item.first_name} {item.last_name}</p>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">{item.next_action || "Action à effectuer"} · {item.next_action_at ? formatDateTime(item.next_action_at) : ""}</p>
                </Link>
              ))}
              {upcomingActionsResult.data?.length === 0 && <p className="text-xs text-zinc-600">Aucune échéance planifiée.</p>}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function QuickLink({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-3.5 transition hover:border-amber-400/30 hover:bg-white/[0.035]"
    >
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{detail}</p>
      </div>
      <ArrowIcon className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-amber-400" />
    </Link>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function DashboardIcon({ name }: { name: "briefcase" | "clock" | "check" | "users" }) {
  const paths = {
    briefcase: <><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M4 7h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1Z" /><path d="M3 12h18M10 12v2h4v-2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2-6 6-6 2 0 3.5.5 4.5 1.5M15 18l2 2 4-5" /></>,
    users: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-4 2-6 6-6s6 2 6 6M14 15c4 0 7 1.5 7 5" /></>,
  };
  return <BaseIcon className="h-5 w-5">{paths[name]}</BaseIcon>;
}

function SparklesIcon({ className }: { className: string }) {
  return <BaseIcon className={className}><path d="m12 3 1 3.5L16.5 8 13 9.5 12 13l-1-3.5L7.5 8 11 6.5 12 3ZM5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14ZM19 12l.6 1.9 1.9.6-1.9.6L19 17l-.6-1.9-1.9-.6 1.9-.6L19 12Z" /></BaseIcon>;
}

function PlusIcon({ className }: { className: string }) {
  return <BaseIcon className={className}><path d="M12 5v14M5 12h14" /></BaseIcon>;
}

function FileIcon({ className }: { className: string }) {
  return <BaseIcon className={className}><path d="M6 2h8l4 4v16H6V2Z" /><path d="M14 2v5h4M9 13h6M9 17h4" /></BaseIcon>;
}

function ArrowIcon({ className }: { className: string }) {
  return <BaseIcon className={className}><path d="M7 17 17 7M8 7h9v9" /></BaseIcon>;
}

function BaseIcon({ className, children }: { className: string; children: React.ReactNode }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
