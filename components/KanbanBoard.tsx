"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Tache = {
  id: string;
  titre: string;
  description: string | null;
  statut: string | null;
  priorite: string | null;
  deadline: string | null;
  responsable: string | null;
};

const colonnes = ["À faire", "En cours", "Terminé"];

export default function KanbanBoard({ taches }: { taches: Tache[] }) {
  const [items, setItems] = useState(taches);

  async function updateStatus(id: string, statut: string) {
    setItems((current) =>
      current.map((tache) =>
        tache.id === id ? { ...tache, statut } : tache
      )
    );

    const { error } = await supabaseBrowser
      .from("taches")
      .update({ statut })
      .eq("id", id);

    if (error) alert(error.message);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {colonnes.map((colonne) => {
        const tachesColonne = items.filter(
          (tache) => (tache.statut || "À faire") === colonne
        );

        return (
          <section key={colonne} className="min-h-[500px] rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{colonne}</h2>
              <span className="text-zinc-500">{tachesColonne.length}</span>
            </div>

            <div className="space-y-4">
              {tachesColonne.map((tache) => (
                <div key={tache.id} className="rounded-2xl border border-zinc-800 bg-black p-5">
                  <a href={`/taches/${tache.id}`} className="block text-lg font-bold hover:underline">
                    {tache.titre}
                  </a>

                  {tache.description && (
                    <p className="mt-3 text-sm text-zinc-400">{tache.description}</p>
                  )}

                  <p className="mt-4 text-sm text-zinc-500">
                    Responsable : {tache.responsable || "Non assigné"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Deadline : {tache.deadline || "Non renseignée"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Priorité : {tache.priorite || "Non renseignée"}
                  </p>

                  <select value={tache.statut || "À faire"} onChange={(e) => updateStatus(tache.id, e.target.value)} className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white">
                    {colonnes.map((statut) => (
                      <option key={statut} value={statut}>
                        {statut}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}