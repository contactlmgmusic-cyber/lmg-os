"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Section = {
  title: string;
  items: string[];
};

export default function AssistantGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);

  const [result, setResult] = useState<{
    strategy: string[];
    content: string[];
    rollout: string[];
    tasks: string[];
  } | null>(null);

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);

    setTimeout(() => {
      setResult({
        strategy: [
          "Créer une identité visuelle cohérente autour du single",
          "Accent TikTok/Reels avec snippets courts",
          "Collaborer avec micro-influenceurs niche musique",
          "Pré-save campagne 10 jours avant sortie",
        ],
        content: [
          "Teaser studio session",
          "Snippet voiture / lifestyle",
          "Trend TikTok avec hook principal",
          "Behind the scenes shooting",
          "Countdown stories Instagram",
        ],
        rollout: [
          "J-14 : annonce cover",
          "J-10 : lancement pré-save",
          "J-7 : teaser vidéo",
          "J-3 : extrait TikTok",
          "Jour J : sortie + clip teaser",
          "J+3 : repost réactions fans",
        ],
        tasks: [
          "Créer visuels promo",
          "Programmer posts Instagram",
          "Uploader DSP",
          "Contacter influenceurs",
          "Préparer campagne Meta Ads",
        ],
      });

      setLoading(false);
    }, 1200);
  }

  async function createTasks() {
    if (!result?.tasks?.length) return;

    setCreatingTasks(true);

    const { error } = await supabaseBrowser.from("taches").insert(
      result.tasks.map((task) => ({
        titre: task,
        description: `Généré depuis l'assistant IA : ${prompt}`,
        statut: "À faire",
        priorite: "Moyenne",
      }))
    );

    if (error) {
      alert(error.message);
      setCreatingTasks(false);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Assistant IA",
      titre: "Tâches générées",
      description: `${result.tasks.length} tâches ajoutées au Kanban`,
    });

    setCreatingTasks(false);
    alert("Tâches ajoutées au Kanban !");
  }

  function SectionBlock({ title, items }: Section) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-black p-4 text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="text-3xl font-bold">Générateur IA Label</h2>

        <p className="mt-3 text-zinc-400">
          Décris un projet musical, une sortie ou une stratégie.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Exemple : Single afro summer vibe pour TikTok avec rollout été..."
          className="mt-6 min-h-40 w-full rounded-2xl border border-zinc-800 bg-black p-5 text-white outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="rounded-2xl bg-white px-6 py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Génération..." : "Générer stratégie"}
          </button>

          {result && (
            <button
              type="button"
              onClick={createTasks}
              disabled={creatingTasks}
              className="rounded-2xl border border-zinc-700 px-6 py-4 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {creatingTasks
                ? "Création..."
                : "Créer ces tâches dans le Kanban"}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionBlock title="Stratégie" items={result.strategy} />
          <SectionBlock title="Idées contenu" items={result.content} />
          <SectionBlock title="Rollout" items={result.rollout} />
          <SectionBlock title="Tâches équipe" items={result.tasks} />
        </div>
      )}
    </div>
  );
}