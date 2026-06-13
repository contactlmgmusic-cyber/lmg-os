"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const templateTasks = [
  { titre: "Finaliser la cover", jours_avant: 60 },
  { titre: "Valider le master", jours_avant: 50 },
  { titre: "Envoyer en distribution", jours_avant: 45 },
  { titre: "Préparer le press kit", jours_avant: 30 },
  { titre: "Planifier les teasers", jours_avant: 21 },
  { titre: "Activer influenceurs", jours_avant: 14 },
  { titre: "Pitch playlists / médias", jours_avant: 7 },
  { titre: "Préparer posts Jour J", jours_avant: 3 },
  { titre: "Release Day", jours_avant: 0 },
  { titre: "Analyser performances", jours_avant: -7 },
];

export default function ReleasePlannerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sortieId = params.id as string;

  const [sortie, setSortie] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadData() {
    const { data: sortieData } = await supabaseBrowser
      .from("sorties")
      .select(`
        *,
        artistes ( id, nom ),
        projets ( id, titre )
      `)
      .eq("id", sortieId)
      .single();

    const { data: tasksData } = await supabaseBrowser
      .from("release_tasks")
      .select("*")
      .eq("sortie_id", sortieId)
      .order("jours_avant", { ascending: false });

    setSortie(sortieData);
    setTasks(tasksData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (sortieId) loadData();
  }, [sortieId]);

  const progression = useMemo(() => {
    if (tasks.length === 0) return 0;

    const done = tasks.filter((task) => task.statut === "Terminé").length;

    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  async function generateChecklist() {
    if (!sortie?.date_sortie) {
      alert("Ajoute une date de sortie avant de générer la checklist.");
      return;
    }

    if (tasks.length > 0) {
      const confirmGenerate = confirm(
        "Une checklist existe déjà. Générer quand même ?"
      );

      if (!confirmGenerate) return;
    }

    setGenerating(true);

    const releaseDate = new Date(sortie.date_sortie);

    const rows = templateTasks.map((task) => {
      const datePrevue = new Date(releaseDate);
      datePrevue.setDate(releaseDate.getDate() - task.jours_avant);

      return {
        sortie_id: sortie.id,
        projet_id: sortie.projet_id || null,
        titre: task.titre,
        jours_avant: task.jours_avant,
        statut: "À faire",
        date_prevue: datePrevue.toISOString().split("T")[0],
      };
    });

    const { error } = await supabaseBrowser.from("release_tasks").insert(rows);

    setGenerating(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  }

  async function toggleTask(task: any) {
    const nextStatus =
      task.statut === "Terminé" ? "À faire" : "Terminé";

    const { error } = await supabaseBrowser
      .from("release_tasks")
      .update({
        statut: nextStatus,
        date_realisation:
          nextStatus === "Terminé"
            ? new Date().toISOString().split("T")[0]
            : null,
      })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              statut: nextStatus,
              date_realisation:
                nextStatus === "Terminé"
                  ? new Date().toISOString().split("T")[0]
                  : null,
            }
          : item
      )
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  if (!sortie) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Sortie introuvable.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link
        href="/release-planner"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour Release Planner
      </Link>

      <div className="mt-8 mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            {sortie.artistes?.nom || "Artiste non lié"}
          </p>

          <h1 className="text-5xl font-bold">{sortie.titre}</h1>

          <p className="mt-3 text-zinc-400">
            {sortie.type || "Sortie"} • {sortie.date_sortie || "Date non renseignée"}
          </p>
        </div>

        <button
          onClick={generateChecklist}
          disabled={generating}
          className="rounded-xl bg-white px-6 py-4 font-semibold text-black disabled:opacity-50"
        >
          {generating ? "Génération..." : "Générer checklist"}
        </button>
      </div>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Progression release</h2>
          <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {progression}%
          </span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-black">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progression}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          {tasks.filter((task) => task.statut === "Terminé").length} /{" "}
          {tasks.length} actions terminées
        </p>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Checklist sortie</h2>

        {tasks.length === 0 && (
          <p className="text-zinc-500">
            Aucune checklist générée pour cette sortie.
          </p>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task)}
              className={`w-full rounded-2xl border p-5 text-left transition hover:border-zinc-500 ${
                task.statut === "Terminé"
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-zinc-800 bg-black"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">
                    {task.jours_avant > 0
                      ? `J-${task.jours_avant}`
                      : task.jours_avant === 0
                      ? "Jour J"
                      : `J+${Math.abs(task.jours_avant)}`}
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {task.titre}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Date prévue : {task.date_prevue || "Non renseignée"}
                  </p>
                </div>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {task.statut}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}