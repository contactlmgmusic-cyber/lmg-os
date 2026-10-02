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
};

const departmentLabels: Record<string, string> = {
  music: "Music",
  creative: "Creative",
  business: "Business",
  tech_digital: "Tech & Digital",
  multiple: "Plusieurs pôles",
};

export default async function SpontaneousApplicationsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const supabase =
    await createAuthenticatedSupabaseClient();

  const { data: applications, error } =
    await supabase
      .from("careers_applications")
      .select(`
        id,
        first_name,
        last_name,
        email,
        department_interest,
        status,
        created_at
      `)
      .eq("application_type", "spontaneous")
      .order("created_at", {
        ascending: false,
      });

  return (
    <main className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Careers
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Candidatures spontanées
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Profils ayant directement pris contact avec
          LMG en dehors d&apos;une offre publiée.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Impossible de charger les candidatures :{" "}
          {error.message}
        </div>
      )}

      {!error && applications?.length === 0 && (
        <div className="rounded-2xl border bg-card p-10">
          <p className="font-medium">
            Aucune candidature spontanée.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Les profils envoyés depuis LMG Careers
            apparaîtront ici.
          </p>
        </div>
      )}

      {!!applications?.length && (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="hidden grid-cols-[1.2fr_1fr_160px_150px] gap-5 border-b bg-muted/30 px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>Candidat</span>
            <span>Univers</span>
            <span>Statut</span>
            <span>Date</span>
          </div>

          <div className="divide-y">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`/recrutement/candidatures/${application.id}`}
                className="grid gap-5 px-6 py-5 transition hover:bg-muted/40 md:grid-cols-[1.2fr_1fr_160px_150px] md:items-center"
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

                <p className="text-sm">
                  {departmentLabels[
                    application.department_interest ?? ""
                  ] ?? "Non précisé"}
                </p>

                <div>
                  <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {statusLabels[
                      application.status
                    ] ?? application.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  ).format(
                    new Date(
                      application.created_at
                    )
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
