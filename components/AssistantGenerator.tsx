"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function AssistantGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [result, setResult] = useState<{
    strategy: string[];
    content: string[];
    rollout: string[];
    tasks: string[];
  } | null>(null);

  function addDays(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);

    setTimeout(() => {
      setResult({
        strategy: [
          "Créer une identité visuelle cohérente autour du single",
          "Construire une campagne TikTok/Reels autour du hook principal",
          "Préparer une montée en pression progressive avant la sortie",
          "Activer les relais proches : fans, micro-influenceurs, entourage",
        ],
        content: [
          "Teaser studio session",
          "Snippet TikTok / Reels",
          "Cover reveal",
          "Behind the scenes shooting",
          "Countdown stories Instagram",
        ],
        rollout: [
          "Annonce cover",
          "Lancement pré-save",
          "Teaser vidéo",
          "Extrait TikTok",
          "Jour de sortie",
          "Repost réactions fans",
        ],
        tasks: [
          "Créer les visuels promo",
          "Programmer les posts Instagram",
          "Uploader le projet sur DSP",
          "Contacter les influenceurs",
          "Préparer la campagne Meta Ads",
        ],
      });

      setLoading(false);
    }, 1200);
  }

  async function createTasksAndRollout() {
    if (!result) return;

    setCreating(true);

    const taskRows = result.tasks.map((task) => ({
      titre: task,
      description: `Généré depuis l'assistant IA : ${prompt}`,
      statut: "À faire",
      priorite: "Moyenne",
    }));

    const rolloutRows = result.rollout.map((event, index) => ({
      titre: event,
      type: "IA Rollout",
      statut: "À faire",
      date_event: addDays(index * 3),
      notes: `Généré depuis l'assistant IA : ${prompt}`,
      generated_by_ai: true,
    }));

    const { error: tasksError } = await supabaseBrowser
      .from("taches")
      .insert(taskRows);

    if (tasksError) {
      alert(tasksError.message);
      setCreating(false);
      return;
    }

    const { error: rolloutError } = await supabaseBrowser
      .from("rollout_events")
      .insert(rolloutRows);

    if (rolloutError) {
      alert(rolloutError.message);
      setCreating(false);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Assistant IA",
      titre: "Rollout généré",
      description: `${result.tasks.length} tâches et ${result.rollout.length} actions rollout créées`,
    });

    setCreating(false);
    alert("Tâches + rollout ajoutés avec succès !");
  }

  function SectionBlock({
    title,
    items,
  }: {
    title: string;
    items: string[];
  }) {
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
              onClick={createTasksAndRollout}
              disabled={creating}
              className="rounded-2xl border border-zinc-700 px-6 py-4 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {creating
                ? "Création..."
                : "Créer tâches + rollout"}
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