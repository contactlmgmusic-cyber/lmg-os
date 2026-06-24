"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

const releaseTemplates: Record<string, any[]> = {
  Single: [
    { titre: "Finaliser le mix", jours_avant: 60, categorie: "Production" },
    { titre: "Valider le master", jours_avant: 55, categorie: "Production" },
    { titre: "Finaliser la cover", jours_avant: 50, categorie: "Créatif" },
    { titre: "Valider les métadonnées", jours_avant: 45, categorie: "Distribution" },
    { titre: "Envoyer en distribution", jours_avant: 40, categorie: "Distribution" },
    { titre: "Préparer le press kit", jours_avant: 30, categorie: "Médias" },
    { titre: "Préparer 10 contenus courts", jours_avant: 25, categorie: "Marketing" },
    { titre: "Planifier les teasers", jours_avant: 21, categorie: "Marketing" },
    { titre: "Créer le pré-save", jours_avant: 18, categorie: "Distribution" },
    { titre: "Activer influenceurs", jours_avant: 14, categorie: "Marketing" },
    { titre: "Pitch playlists / médias", jours_avant: 10, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 3, categorie: "Release Day" },
    { titre: "Publier le contenu officiel", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser les performances", jours_avant: -7, categorie: "Analyse" },
  ],

  EP: [
    { titre: "Valider tracklist EP", jours_avant: 90, categorie: "Production" },
    { titre: "Finaliser tous les masters", jours_avant: 75, categorie: "Production" },
    { titre: "Valider cover EP", jours_avant: 65, categorie: "Créatif" },
    { titre: "Créer les visuels par titre", jours_avant: 60, categorie: "Créatif" },
    { titre: "Envoyer EP en distribution", jours_avant: 50, categorie: "Distribution" },
    { titre: "Créer le pré-save EP", jours_avant: 40, categorie: "Distribution" },
    { titre: "Préparer press kit EP", jours_avant: 35, categorie: "Médias" },
    { titre: "Planifier contenus TikTok/Reels", jours_avant: 30, categorie: "Marketing" },
    { titre: "Préparer storytelling autour de l’EP", jours_avant: 25, categorie: "Marketing" },
    { titre: "Pitch médias / playlists", jours_avant: 14, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 3, categorie: "Release Day" },
    { titre: "Sortie officielle EP", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser titres les plus performants", jours_avant: -7, categorie: "Analyse" },
  ],

  Album: [
    { titre: "Valider direction artistique album", jours_avant: 120, categorie: "Stratégie" },
    { titre: "Valider tracklist album", jours_avant: 100, categorie: "Production" },
    { titre: "Finaliser masters album", jours_avant: 85, categorie: "Production" },
    { titre: "Valider cover album", jours_avant: 75, categorie: "Créatif" },
    { titre: "Créer press kit album", jours_avant: 60, categorie: "Médias" },
    { titre: "Envoyer album en distribution", jours_avant: 55, categorie: "Distribution" },
    { titre: "Préparer campagne contenu", jours_avant: 45, categorie: "Marketing" },
    { titre: "Préparer campagne médias", jours_avant: 35, categorie: "Médias" },
    { titre: "Préparer activation release party", jours_avant: 25, categorie: "Événement" },
    { titre: "Pitch playlists / médias", jours_avant: 20, categorie: "Médias" },
    { titre: "Préparer posts Jour J", jours_avant: 5, categorie: "Release Day" },
    { titre: "Sortie officielle album", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser performances globales", jours_avant: -10, categorie: "Analyse" },
  ],

  Clip: [
    { titre: "Valider scénario / concept clip", jours_avant: 45, categorie: "Créatif" },
    { titre: "Valider date de tournage", jours_avant: 40, categorie: "Production" },
    { titre: "Valider lieux / équipe", jours_avant: 35, categorie: "Production" },
    { titre: "Tourner le clip", jours_avant: 25, categorie: "Production" },
    { titre: "Valider montage V1", jours_avant: 18, categorie: "Post-production" },
    { titre: "Valider montage final", jours_avant: 12, categorie: "Post-production" },
    { titre: "Préparer teaser clip", jours_avant: 7, categorie: "Marketing" },
    { titre: "Programmer première YouTube", jours_avant: 5, categorie: "Distribution" },
    { titre: "Publier le clip", jours_avant: 0, categorie: "Release Day" },
    { titre: "Analyser vues et rétention", jours_avant: -7, categorie: "Analyse" },
  ],
};

function getTemplateForSortie(type?: string) {
  if (!type) return releaseTemplates.Single;

  const normalized = type.toLowerCase();

  if (normalized.includes("ep")) return releaseTemplates.EP;
  if (normalized.includes("album")) return releaseTemplates.Album;
  if (normalized.includes("clip")) return releaseTemplates.Clip;

  return releaseTemplates.Single;
}

export default function ReleasePlannerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sortieId = params.id as string;

  const [sortie, setSortie] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN
    ) {
      router.push("/");
      return;
    }

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
      "Une checklist existe déjà. Régénérer va remplacer l’ancienne checklist."
    );

    if (!confirmGenerate) return;
  }

  setGenerating(true);

  const response = await fetch("/api/assistant/checklist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sortieId: sortie.id,
    }),
  });

  const data = await response.json();

  setGenerating(false);

  if (!response.ok) {
    alert(data.error || "Erreur génération checklist.");
    return;
  }

  alert(data.message || "Checklist générée.");
  await loadData();
}

  async function toggleTask(task: any) {
    const nextStatus = task.statut === "Terminé" ? "À faire" : "Terminé";

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

  const categories = Array.from(
  new Set(tasks.map((task) => task.categorie || "Général"))
);

const categoryProgress = categories.map((categorie) => {
  const categoryTasks = tasks.filter(
    (task) => (task.categorie || "Général") === categorie
  );

  const done = categoryTasks.filter(
    (task) => task.statut === "Terminé"
  ).length;

  return {
    categorie,
    total: categoryTasks.length,
    done,
    progress:
      categoryTasks.length > 0
        ? Math.round((done / categoryTasks.length) * 100)
        : 0,
  };
});

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

      <div className="mb-10 mt-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            {sortie.artistes?.nom || "Artiste non lié"}
          </p>

          <h1 className="text-5xl font-bold">{sortie.titre}</h1>

          <p className="mt-3 text-zinc-400">
            {sortie.type || "Sortie"} •{" "}
            {sortie.date_sortie || "Date non renseignée"}
          </p>
        </div>

<section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  {categoryProgress.map((item) => (
    <div
      key={item.categorie}
      className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <p className="text-sm text-zinc-500">{item.categorie}</p>

      <h3 className="mt-2 text-3xl font-bold">{item.progress}%</h3>

      <p className="mt-2 text-xs text-zinc-500">
        {item.done} / {item.total} actions
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${item.progress}%` }}
        />
      </div>
    </div>
  ))}
</section>

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

                  <p className="mt-1 text-xs text-blue-300">
  {task.categorie || "Général"}
</p>

                  <h3 className="mt-1 text-xl font-semibold">{task.titre}</h3>

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