import { supabase } from "@/lib/supabase";
import RolloutKanban from "@/components/RolloutKanban";

export const dynamic = "force-dynamic";

export default async function RolloutPage() {
  const { data: events, error } = await supabase
    .from("rollout_events")
    .select(`
      *,
      projets (
        id,
        titre
      )
    `)
    .order("date_event", { ascending: true });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Rollout
          </p>

          <h1 className="text-5xl font-bold">Kanban rollout</h1>

          <p className="mt-2 text-zinc-400">
            Suivi des actions promo, contenus, clips et sorties.
          </p>
        </div>

        <a
          href="/rollout/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Ajouter action
        </a>
      </div>

      <RolloutKanban events={events || []} />
    </main>
  );
}