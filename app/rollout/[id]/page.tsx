import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function RolloutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event, error } = await supabase
    .from("rollout_events")
    .select(`
      *,
      projets (
        id,
        titre,
        cover_url,
        artistes (
          id,
          nom
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !event) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Action rollout introuvable.</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <Link
        href="/rollout"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour au Kanban
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Action rollout
          </p>

          <h1 className="text-5xl font-bold">{event.titre}</h1>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Type</p>
              <p className="mt-2 font-semibold">
                {event.type || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Statut</p>
              <p className="mt-2 font-semibold">
                {event.statut || "À faire"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Date</p>
              <p className="mt-2 font-semibold">
                {event.date_event || "Non renseignée"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes / brief</h2>

            <p className="mt-4 leading-relaxed text-zinc-300">
              {event.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            {event.projets?.cover_url ? (
              <img
                src={event.projets.cover_url}
                alt={event.projets.titre}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center bg-zinc-800 text-zinc-500">
                Aucune cover
              </div>
            )}

            <div className="p-6">
              <p className="text-sm text-zinc-500">Projet lié</p>

              <h2 className="mt-2 text-2xl font-bold">
                {event.projets?.titre || "Projet non lié"}
              </h2>

              <p className="mt-2 text-zinc-400">
                {event.projets?.artistes?.nom || "Artiste non lié"}
              </p>

              {event.projets?.id && (
                <a
                  href={`/projets/${event.projets.id}`}
                  className="mt-5 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
                >
                  Voir projet
                </a>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Actions</h2>

            <div className="mt-5 space-y-3">
              <a
                href={`/rollout/${event.id}/modifier`}
                className="block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
              >
                Modifier action
              </a>

              <a
                href="/rollout/nouveau"
                className="block rounded-xl border border-zinc-700 px-5 py-3 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Nouvelle action
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}