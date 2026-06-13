import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  const { data: objectifs } = await supabase
    .from("objectifs_artistes")
    .select(`
      *,
      artistes (
        id,
        nom
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Artist Goals
          </p>

          <h1 className="text-5xl font-bold">
            Objectifs artistes
          </h1>
        </div>

        <Link
          href="/objectifs/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
        >
          + Nouvel objectif
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {objectifs?.map((objectif: any) => {
          const progression =
            objectif.objectif > 0
              ? Math.min(
                  100,
                  Math.round(
                    (objectif.actuel / objectif.objectif) * 100
                  )
                )
              : 0;

          return (
            <div
              key={objectif.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    {objectif.artistes?.nom || "Artiste"}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {objectif.type}
                  </h2>
                </div>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm">
                  {objectif.statut}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{objectif.actuel}</span>
                  <span>{objectif.objectif}</span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${progression}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-sm text-zinc-500">
                  {progression}% atteint
                </p>
              </div>

              <p className="mt-4 text-sm text-zinc-500">
                Échéance : {objectif.date_limite || "Non définie"}
              </p>
            </div>
          );
        })}

        {(!objectifs || objectifs.length === 0) && (
          <p className="text-zinc-500">
            Aucun objectif créé.
          </p>
        )}
      </div>
    </main>
  );
}