import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ArtisteEventsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ]);

  const { data: events } = await supabase
    .from("artiste_events")
    .select(`
      *,
      artistes (
        id,
        nom
      )
    `)
    .order("date_event", { ascending: true });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Artist Events
          </p>

          <h1 className="text-5xl font-bold">Événements artistes</h1>

          <p className="mt-3 text-zinc-400">
            Répétitions, studios, shootings, tournages, interviews et rendez-vous.
          </p>
        </div>

        <Link
          href="/artiste-events/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouvel événement
        </Link>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        {(!events || events.length === 0) && (
          <p className="text-zinc-500">Aucun événement artiste.</p>
        )}

        <div className="space-y-4">
          {events?.map((event: any) => (
            <div
              key={event.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-blue-300">
                    {event.type || "Événement"} • {event.artistes?.nom || "Artiste"}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {event.titre}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {event.date_event || "Date non renseignée"}
                    {event.heure ? ` • ${event.heure}` : ""}
                    {event.lieu ? ` • ${event.lieu}` : ""}
                  </p>

                  {event.description && (
                    <p className="mt-3 text-sm text-zinc-400">
                      {event.description}
                    </p>
                  )}
                </div>

                <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {event.statut || "Prévu"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}