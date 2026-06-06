"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Candidature = {
  id: string;
  nom_artiste: string | null;
  email: string;
  instagram: string | null;
  lien_musique: string | null;
  message: string | null;
  statut: string | null;
  created_at: string;
};

export default function CandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCandidatures() {
    const { data, error } = await supabaseBrowser
      .from("candidatures")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setCandidatures(data || []);
    }

    setLoading(false);
  }

  async function updateStatut(id: string, statut: string) {
    await supabaseBrowser
      .from("candidatures")
      .update({ statut })
      .eq("id", id);

    loadCandidatures();
  }

  useEffect(() => {
    loadCandidatures();
  }, []);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-yellow-500">
          Legacy Music Group
        </p>

        <h1 className="text-5xl font-black">Candidatures artistes</h1>

        <p className="mt-3 text-zinc-400">
          Toutes les candidatures reçues depuis le site public LMG.
        </p>
      </div>

      {loading && <p className="text-zinc-500">Chargement...</p>}

      {!loading && candidatures.length === 0 && (
        <p className="text-zinc-500">Aucune candidature pour le moment.</p>
      )}

      <div className="grid gap-6">
        {candidatures.map((candidature) => (
          <div
            key={candidature.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
                  {candidature.statut || "nouvelle"}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {candidature.nom_artiste || "Artiste non renseigné"}
                </h2>

                <p className="mt-2 text-zinc-400">{candidature.email}</p>

                {candidature.instagram && (
                  <p className="mt-1 text-zinc-400">
                    Instagram : {candidature.instagram}
                  </p>
                )}

                {candidature.lien_musique && (
                  <a
                    href={candidature.lien_musique}
                    target="_blank"
                    className="mt-3 inline-block text-yellow-500 hover:text-yellow-400"
                  >
                    Écouter le lien musique →
                  </a>
                )}
              </div>

              <select
                value={candidature.statut || "nouvelle"}
                onChange={(e) =>
                  updateStatut(candidature.id, e.target.value)
                }
                className="rounded-full border border-zinc-700 bg-black px-5 py-3 text-white outline-none"
              >
                <option value="nouvelle">Nouvelle</option>
                <option value="en étude">En étude</option>
                <option value="entretien">Entretien</option>
                <option value="acceptée">Acceptée</option>
                <option value="refusée">Refusée</option>
              </select>
            </div>

            {candidature.message && (
              <p className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 leading-7 text-zinc-300">
                {candidature.message}
              </p>
            )}

            <p className="mt-4 text-xs text-zinc-600">
              Reçue le{" "}
              {new Date(candidature.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}