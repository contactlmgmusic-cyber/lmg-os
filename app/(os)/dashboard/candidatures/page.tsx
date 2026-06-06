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
  priorite: string | null;
  assigned_to: string | null;
  note_interne: string | null;
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

    if (!error) setCandidatures(data || []);
    setLoading(false);
  }

  async function updateCandidature(
    id: string,
    updates: Partial<Candidature>
  ) {
    const { error } = await supabaseBrowser
      .from("candidatures")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

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
          Suivi des candidatures reçues depuis le site public LMG.
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
            <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
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

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <div className="grid gap-4">
                  <label className="text-sm text-zinc-400">
                    Statut
                    <select
                      value={candidature.statut || "nouvelle"}
                      onChange={(e) =>
                        updateCandidature(candidature.id, {
                          statut: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    >
                      <option value="nouvelle">Nouvelle</option>
                      <option value="en étude">En étude</option>
                      <option value="entretien">Entretien</option>
                      <option value="acceptée">Acceptée</option>
                      <option value="refusée">Refusée</option>
                    </select>
                  </label>

                  <label className="text-sm text-zinc-400">
                    Priorité
                    <select
                      value={candidature.priorite || "moyenne"}
                      onChange={(e) =>
                        updateCandidature(candidature.id, {
                          priorite: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    >
                      <option value="haute">Haute</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="faible">Faible</option>
                    </select>
                  </label>

                  <label className="text-sm text-zinc-400">
                    Assigné à
                    <input
                      defaultValue={candidature.assigned_to || ""}
                      placeholder="Yliana / Joseph / Manager..."
                      onBlur={(e) =>
                        updateCandidature(candidature.id, {
                          assigned_to: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    />
                  </label>

                  <label className="text-sm text-zinc-400">
                    Note interne
                    <textarea
                      defaultValue={candidature.note_interne || ""}
                      placeholder="Potentiel, points forts, actions à faire..."
                      rows={5}
                      onBlur={(e) =>
                        updateCandidature(candidature.id, {
                          note_interne: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}