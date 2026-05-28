"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AssistantRolloutPage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [projetId, setProjetId] = useState("");
  const [resultat, setResultat] = useState("");

  useEffect(() => {
    async function fetchProjets() {
      const { data } = await supabaseBrowser
        .from("projets")
        .select(`
          *,
          artistes (
            nom,
            style
          )
        `)
        .order("created_at", { ascending: false });

      setProjets(data || []);
    }

    fetchProjets();
  }, []);

  function generateRollout() {
    const projet = projets.find((p) => p.id === projetId);

    if (!projet) {
      alert("Choisis un projet.");
      return;
    }

    const plan = `
ROLLOUT LMG — ${projet.titre}

Artiste : ${projet.artistes?.nom || "Non renseigné"}
Style : ${projet.artistes?.style || "Non renseigné"}
Type : ${projet.type || "Projet"}
Date de sortie : ${projet.date_sortie || "À définir"}

PHASE 1 — Pré-lancement
- Définir le storytelling du projet
- Valider cover, teaser, extrait audio
- Préparer 5 à 10 contenus courts
- Créer une annonce officielle
- Préparer les assets presse / réseaux

PHASE 2 — Teasing
- Teaser visuel J-14
- Extrait audio J-10
- Behind the scenes J-7
- Compte à rebours stories J-5 à J-1
- Activation TikTok/Reels avec hook fort

PHASE 3 — Sortie
- Post annonce sortie
- Reels/TikTok performance ou mood
- Stories avec lien streaming
- Relance communauté
- Envoi pitch médias / playlists / partenaires

PHASE 4 — Post-sortie
- Contenu paroles / lyrics
- Vidéo réaction public
- Extrait live ou studio
- Relance radio / médias
- Analyse premiers résultats

NOTES STRATÉGIQUES
${projet.notes || "Aucune note projet renseignée."}
`;

    setResultat(plan.trim());
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">Générateur rollout</h1>

        <p className="mt-3 text-zinc-400">
          Génère une première base de rollout à partir d’un projet LMG.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <select
            value={projetId}
            onChange={(e) => setProjetId(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="">Choisir un projet</option>

            {projets.map((projet) => (
              <option key={projet.id} value={projet.id}>
                {projet.titre}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={generateRollout}
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200"
          >
            Générer le rollout
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-5 text-3xl font-bold">Résultat</h2>

          {!resultat && (
            <p className="text-zinc-500">
              Sélectionne un projet puis génère ton rollout.
            </p>
          )}

          {resultat && (
            <pre className="whitespace-pre-wrap rounded-2xl bg-black p-6 text-sm leading-relaxed text-zinc-300">
              {resultat}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}