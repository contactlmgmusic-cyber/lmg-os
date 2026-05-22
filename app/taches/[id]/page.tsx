import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TacheDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: tache, error } = await supabase
    .from("taches")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tache) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Tâche introuvable.</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <Link href="/taches" className="text-sm text-zinc-400 hover:text-white">
        ← Retour aux tâches
      </Link>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Fiche tâche
        </p>

        <h1 className="text-5xl font-bold">{tache.titre}</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-sm text-zinc-500">Statut</p>
            <p className="mt-2 font-semibold">{tache.statut || "À faire"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-sm text-zinc-500">Priorité</p>
            <p className="mt-2 font-semibold">
              {tache.priorite || "Non renseignée"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-sm text-zinc-500">Deadline</p>
            <p className="mt-2 font-semibold">
              {tache.deadline || "Non renseignée"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
          <h2 className="text-2xl font-bold">Description</h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            {tache.description || "Aucune description renseignée."}
          </p>
        </div>
        <a
  href={`/taches/${tache.id}/modifier`}
  className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-medium text-black"
>
  Modifier la tâche
</a>
      </section>
    </main>
  );
}