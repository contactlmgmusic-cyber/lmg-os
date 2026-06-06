"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function TikTokAssistantPage() {
  const [artistes, setArtistes] = useState<any[]>([]);
  const [artisteId, setArtisteId] = useState("");
  const [resultat, setResultat] = useState("");

  useEffect(() => {
    async function fetchArtistes() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("*")
        .order("nom");

      setArtistes(data || []);
    }

    fetchArtistes();
  }, []);

  function generateStrategy() {
    const artiste = artistes.find((a) => a.id === artisteId);

    if (!artiste) {
      alert("Choisis un artiste.");
      return;
    }

    const plan = `
STRATÉGIE TIKTOK LMG

Artiste : ${artiste.nom}
Style : ${artiste.style || "Non renseigné"}

OBJECTIF :
Créer de la répétition, de la proximité et des moments viraux.

SEMAINE 1
• Présentation artiste
• Pourquoi je fais de la musique
• Extrait inédit
• Behind the scenes studio
• Storytime personnel

SEMAINE 2
• Challenge avec un extrait
• Réaction d'amis au morceau
• Session voiture
• Freestyle caméra
• Tendance TikTok adaptée au son

SEMAINE 3
• Top 3 influences
• Journée dans ma vie
• Making of cover
• Réponse aux commentaires
• Version acoustique

SEMAINE 4
• Best comments
• Coulisses clip
• Extrait préféré
• FAQ artiste
• Appel à l'action streaming

HOOKS À TESTER

- "Personne ne croyait à ce son..."
- "J'ai failli ne jamais sortir ce morceau"
- "Écoute bien la dernière phrase"
- "Tu aurais validé ça ?"
- "Le passage le plus sous-côté du morceau"

FRÉQUENCE

2 à 4 TikTok par jour
1 live par semaine
Stories quotidiennes
Réutilisation sur Reels et Shorts
`;

    setResultat(plan.trim());
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">
          Stratégie TikTok IA
        </h1>

        <p className="mt-3 text-zinc-400">
          Génère un plan TikTok pour un artiste.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <select
            value={artisteId}
            onChange={(e) => setArtisteId(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="">Choisir un artiste</option>

            {artistes.map((artiste) => (
              <option key={artiste.id} value={artiste.id}>
                {artiste.nom}
              </option>
            ))}
          </select>

          <button
            onClick={generateStrategy}
            className="mt-5 w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200"
          >
            Générer stratégie
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-5 text-3xl font-bold">
            Résultat
          </h2>

          {!resultat && (
            <p className="text-zinc-500">
              Sélectionne un artiste pour générer la stratégie.
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