import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

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
  new: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  review:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  interview:
    "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  selected:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "bg-red-500/10 text-red-700 dark:text-red-300",
  talent_pool:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
};

export default async function CareersApplicationsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const supabase =
    await createAuthenticatedSupabaseClient();

  const { data: applications, error } = await supabase
    .from("careers_applications")
    .select(`
      id,
      first_name,
      last_name,
      email,
      status,
      created_at,
      application_type,
      assigned_to,
      next_action,
      next_action_at,
      careers_jobs (
        title,
        department
      )
    `)
    .eq("application_type", "job")
    .order("created_at", { ascending: false });

  const assigneeIds = Array.from(new Set((applications || []).map((item) => item.assigned_to).filter(Boolean))) as string[];
  const { data: assignees } = assigneeIds.length
    ? await supabase.from("profiles").select("id, nom, email").in("id", assigneeIds)
    : { data: [] };
  const assigneeNames = new Map((assignees || []).map((person) => [person.id, person.nom || person.email]));

  return (
    <main className="space-y-6 pb-10">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          LMG Careers
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Candidatures
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Consultez et gérez les candidatures reçues
          depuis LMG Careers.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Impossible de charger les candidatures :
          {" "}
          {error.message}
        </div>
      )}

      {!error && applications?.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-10 text-white">
          <p className="font-medium">
            Aucune candidature reçue.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Les candidatures envoyées depuis LMG Careers
            apparaîtront ici.
          </p>
        </div>
      )}

      {!!applications?.length && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-white">
          <div className="hidden grid-cols-[1.2fr_1fr_160px_150px] gap-5 border-b border-white/10 bg-white/[0.025] px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500 md:grid">
            <span>Candidat</span>
            <span>Offre</span>
            <span>Statut</span>
            <span>Date</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => {
              const job = Array.isArray(
                application.careers_jobs
              )
                ? application.careers_jobs[0]
                : application.careers_jobs;

              return (
                <Link
                  key={application.id}
                  href={`/recrutement/candidatures/${application.id}`}
                  className="grid gap-5 px-6 py-5 transition hover:bg-white/[0.035] md:grid-cols-[1.2fr_1fr_160px_150px] md:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {application.first_name}{" "}
                      {application.last_name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {job?.title ?? "Offre supprimée"}
                    </p>

                    {job?.department && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {job.department.replace(
                          "_",
                          " & "
                        )}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      {application.assigned_to ? `Responsable · ${assigneeNames.get(application.assigned_to) || "Équipe LMG"}` : "Non attribuée"}
                    </p>
                    {application.next_action && (
                      <p className={`mt-1 text-xs ${isOverdue(application.next_action_at) ? "text-red-400" : "text-zinc-500"}`}>
                        {application.next_action}{application.next_action_at ? ` · ${formatDateTime(application.next_action_at)}` : ""}
                      </p>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        statusClasses[
                          application.status
                        ] ?? "bg-muted"
                      }`}
                    >
                      {statusLabels[
                        application.status
                      ] ?? application.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(
                      new Date(application.created_at)
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

function isOverdue(value: string | null) {
  return Boolean(value && Date.parse(value) < Date.now());
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
