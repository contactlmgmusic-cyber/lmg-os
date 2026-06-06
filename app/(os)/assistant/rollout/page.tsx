"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type RolloutTask = {
  titre: string;
  description: string;
  priorite: "Haute" | "Moyenne" | "Basse";
  offsetDays: number;
};

const rolloutTasks: RolloutTask[] = [
  {
    titre: "Définir le storytelling du projet",
    description: "Clarifier l’angle, le message principal et l’univers de sortie.",
    priorite: "Haute",
    offsetDays: -30,
  },
  {
    titre: "Valider cover et assets visuels",
    description: "Finaliser cover, presskit visuel, formats réseaux et éléments promo.",
    priorite: "Haute",
    offsetDays: -25,
  },
  {
    titre: "Préparer les contenus courts",
    description: "Préparer 8 à 12 formats Reels/TikTok/Shorts autour du projet.",
    priorite: "Haute",
    offsetDays: -21,
  },
  {
    titre: "Teaser officiel",
    description: "Publier le premier teaser visuel ou audio.",
    priorite: "Moyenne",
    offsetDays: -14,
  },
  {
    titre: "Extrait audio / hook TikTok",
    description: "Tester un extrait fort pour TikTok, Reels et stories.",
    priorite: "Moyenne",
    offsetDays: -10,
  },
  {
    titre: "Compte à rebours sortie",
    description: "Lancer les stories J-5 à J-1 avec lien de pré-save si disponible.",
    priorite: "Haute",
    offsetDays: -5,
  },
  {
    titre: "Publication sortie officielle",
    description: "Poster l’annonce de sortie sur tous les réseaux.",
    priorite: "Haute",
    offsetDays: 0,
  },
  {
    titre: "Relance communauté",
    description: "Relancer les stories, repartages, commentaires et messages privés.",
    priorite: "Moyenne",
    offsetDays: 2,
  },
  {
    titre: "Contenu lyrics / paroles",
    description: "Publier un contenu paroles ou storytelling autour d’une punchline.",
    priorite: "Moyenne",
    offsetDays: 5,
  },
  {
    titre: "Bilan performance sortie",
    description: "Analyser retours, contenus performants, streams, saves et engagement.",
    priorite: "Haute",
    offsetDays: 14,
  },
];

function addDays(date: string, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

export default function AssistantRolloutPage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [projetId, setProjetId] = useState("");
  const [resultat, setResultat] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

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

    if (!projet.date_sortie) {
      alert("Ajoute une date de sortie au projet avant de générer les tâches.");
      return;
    }

    const tasks = rolloutTasks.map((task) => ({
      ...task,
      deadline: addDays(projet.date_sortie, task.offsetDays),
    }));

    setGeneratedTasks(tasks);

    const plan = `
ROLLOUT LMG — ${projet.titre}

Artiste : ${projet.artistes?.nom || "Non renseigné"}
Style : ${projet.artistes?.style || "Non renseigné"}
Type : ${projet.type || "Projet"}
Date de sortie : ${projet.date_sortie || "À définir"}

PLAN OPÉRATIONNEL

${tasks
  .map(
    (task) =>
      `• ${task.deadline} — ${task.titre}
  Priorité : ${task.priorite}
  ${task.description}`
  )
  .join("\n\n")}

NOTES STRATÉGIQUES
${projet.notes || "Aucune note projet renseignée."}
`;

    setResultat(plan.trim());
  }

  async function createTasks() {
    const projet = projets.find((p) => p.id === projetId);

    if (!projet) {
      alert("Choisis un projet.");
      return;
    }

    if (generatedTasks.length === 0) {
      alert("Génère d’abord le rollout.");
      return;
    }

    setLoadingTasks(true);

    const { error } = await supabaseBrowser.from("taches").insert(
      generatedTasks.map((task) => ({
        titre: task.titre,
        description: task.description,
        statut: "À faire",
        priorite: task.priorite,
        deadline: task.deadline,
        projet_id: projet.id,
      }))
    );

    if (error) {
      alert(error.message);
      setLoadingTasks(false);
      return;
    }

    await supabaseBrowser.from("notifications").insert({
      type: "rollout",
      titre: "Tâches rollout créées",
      description: projet.titre,
      link: `/projets/${projet.id}`,
    });

    setLoadingTasks(false);
    alert("Tâches créées dans le kanban !");
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG AI
        </p>

        <h1 className="text-5xl font-bold">
          Rollout intelligent
        </h1>

        <p className="mt-3 text-zinc-400">
          Génère un plan de sortie J-30 à J+14 et crée automatiquement les tâches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <select
            value={projetId}
            onChange={(e) => {
              setProjetId(e.target.value);
              setResultat("");
              setGeneratedTasks([]);
            }}
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

          <button
            type="button"
            onClick={createTasks}
            disabled={loadingTasks || generatedTasks.length === 0}
            className="w-full rounded-xl border border-zinc-700 px-5 py-4 font-medium text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingTasks ? "Création..." : "Créer les tâches"}
          </button>

          <p className="text-sm text-zinc-500">
            Les tâches seront automatiquement liées au projet sélectionné.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-5 text-3xl font-bold">
            Résultat
          </h2>

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