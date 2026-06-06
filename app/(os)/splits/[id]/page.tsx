import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SplitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: split, error } = await supabase
    .from("splits")
    .select(`
      *,
      projets ( id, titre ),
      artistes ( id, nom ),
      split_participants (
        id,
        nom,
        role,
        pourcentage,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error || !split) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Split sheet introuvable.</p>
      </main>
    );
  }

  const participants = split.split_participants || [];

  const totalPourcentage = participants.reduce(
    (acc: number, p: any) => acc + Number(p.pourcentage || 0),
    0
  );

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/splits" className="text-sm text-zinc-400 hover:text-white">
        ← Retour split sheets
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Split Sheet
          </p>

          <h1 className="mt-3 text-5xl font-bold">{split.titre}</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              {split.statut || "Brouillon"}
            </span>

            <span
              className={`rounded-full border px-4 py-2 text-sm ${
                totalPourcentage === 100
                  ? "border-green-500/40 text-green-300"
                  : "border-red-500/40 text-red-300"
              }`}
            >
              Total : {totalPourcentage}%
            </span>
          </div>

          {totalPourcentage !== 100 && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              Attention : le total des splits doit être égal à 100%.
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Artiste" value={split.artistes?.nom || "Non lié"} />
            <Info label="Projet" value={split.projets?.titre || "Non lié"} />
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>

            <p className="mt-4 leading-relaxed text-zinc-400">
              {split.notes || "Aucune note renseignée."}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="mb-6 text-3xl font-bold">Participants</h2>

            {participants.length === 0 && (
              <p className="text-zinc-500">Aucun participant ajouté.</p>
            )}

            <div className="space-y-4">
              {participants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {participant.nom}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {participant.role || "Rôle non renseigné"} •{" "}
                        {participant.email || "Email non renseigné"}
                      </p>
                    </div>

                    <p className="text-3xl font-bold">
                      {Number(participant.pourcentage || 0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              <Link
                href={`/splits/${split.id}/participants/nouveau`}
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
              >
                Ajouter participant
              </Link>

              {split.projets?.id && (
                <Link
                  href={`/projets/${split.projets.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Voir projet
                </Link>
              )}

              {split.artistes?.id && (
                <Link
                  href={`/artistes/${split.artistes.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Voir artiste
                </Link>
              )}

              <Link
  href={`/splits/${split.id}/supprimer`}
  className="block rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center text-red-300 hover:bg-red-500/20"
>
  Supprimer split sheet
</Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}