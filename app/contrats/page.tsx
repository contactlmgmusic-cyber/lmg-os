import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ContratsPage() {
  const { data: contrats, error } = await supabase
    .from("contrats")
    .select(`
      *,
      artistes (
        id,
        nom
      ),
      projets (
        id,
        titre
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Legal
          </p>

          <h1 className="text-5xl font-bold">Contrats</h1>

          <p className="mt-3 text-zinc-400">
            Contrats artistes, booking, prestations et split sheets.
          </p>
        </div>

        <Link
          href="/contrats/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouveau contrat
        </Link>
      </div>

      {(!contrats || contrats.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucun contrat ajouté.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {contrats?.map((contrat: any) => (
          <div
            key={contrat.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">{contrat.type}</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {contrat.titre}
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                {contrat.statut || "Brouillon"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-zinc-400">
              <p>Artiste : {contrat.artistes?.nom || "Non lié"}</p>
              <p>Projet : {contrat.projets?.titre || "Non lié"}</p>
            </div>

            {contrat.notes && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                {contrat.notes}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              {contrat.fichier_url && (
                <a
                  href={contrat.fichier_url}
                  target="_blank"
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-black"
                >
                  Ouvrir PDF
                </a>
              )}

              <Link
                href={`/contrats/${contrat.id}`}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Détail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}