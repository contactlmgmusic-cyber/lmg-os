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
  const [activeCategory, setActiveCategory] = useState("Toutes");

  async function loadData() {
  setLoading(true);

  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();

  if (!user) {
    router.replace("/login");
    return;
  }

  const { data: profile, error: profileError } =
    await supabaseBrowser
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    router.replace("/dashboard");
    return;
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ARTISTIC_DIRECTOR,
    ROLES.MANAGER,
  ];

  if (!allowedRoles.includes(profile.role)) {
    router.replace("/dashboard");
    return;
  }

  const isManager =
    profile.role === ROLES.MANAGER;

  /*
   * Le manager doit obligatoirement correspondre au
   * manager_id de l’artiste lié à la sortie.
   */
  let sortieQuery = supabaseBrowser
    .from("sorties")
    .select(
      isManager
        ? `
          *,
          artistes!inner (
            id,
            nom,
            manager_id
          ),
          projets (
            id,
            titre
          )
        `
        : `
          *,
          artistes (
            id,
            nom
          ),
          projets (
            id,
            titre
          )
        `
    )
    .eq("id", sortieId);

  if (isManager) {
    sortieQuery = sortieQuery.eq(
      "artistes.manager_id",
      profile.id
    );
  }

  const {
    data: sortieData,
    error: sortieError,
  } = await sortieQuery.maybeSingle();

  /*
   * Si la sortie appartient à un autre manager,
   * elle est considérée comme introuvable.
   */
  if (sortieError || !sortieData) {
    setSortie(null);
    setTasks([]);
    setLoading(false);
    return;
  }

  /*
   * Les tâches ne sont récupérées qu’après avoir
   * vérifié l’accès du manager à la sortie.
   */
  const {
    data: tasksData,
    error: tasksError,
  } = await supabaseBrowser
    .from("release_tasks")
    .select("*")
    .eq("sortie_id", sortieData.id)
    .order("jours_avant", {
      ascending: false,
    });

  if (tasksError) {
    alert(tasksError.message);
    setTasks([]);
  } else {
    setTasks(tasksData || []);
  }

  setSortie(sortieData);
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

const visibleTasks = activeCategory === "Toutes"
  ? tasks
  : tasks.filter((task) => (task.categorie || "Général") === activeCategory);

const doneTasks = tasks.filter((task) => task.statut === "Terminé").length;
const nextTask = tasks.find((task) => task.statut !== "Terminé");

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
        Sortie introuvable ou accès non autorisé.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <Link
        href="/release-planner"
        className="text-sm text-zinc-400 hover:text-white"
      >
        ← Retour Release Planner
      </Link>

      <header className="mb-8 mt-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            {sortie.artistes?.nom || "Artiste non lié"}
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{sortie.titre}</h1>

          <p className="mt-3 text-zinc-400">
            {sortie.type || "Sortie"} •{" "}
            {sortie.date_sortie || "Date non renseignée"}
          </p>
        </div>

        <button
          onClick={generateChecklist}
          disabled={generating}
          className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          {generating ? "Génération..." : "Générer checklist"}
        </button>
      </header>

      <section className="mb-8 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">État de préparation</p><h2 className="mt-2 text-2xl font-bold">Progression globale</h2></div>

          <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {progression}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-black">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progression}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          {doneTasks} / {tasks.length} actions terminées
        </p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Prochaine action</p><p className="mt-3 text-lg font-bold">{nextTask?.titre || "Checklist terminée"}</p><p className="mt-2 text-sm text-zinc-500">{nextTask ? `${nextTask.categorie || "Général"} · ${nextTask.date_prevue || "Date à définir"}` : "La release est prête."}</p></div>
      </section>

      {categoryProgress.length > 0 && <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{categoryProgress.map((item) => <button type="button" onClick={() => setActiveCategory(item.categorie)} key={item.categorie} className={`rounded-2xl border p-5 text-left transition ${activeCategory === item.categorie ? "border-white bg-white text-black" : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"}`}><p className={`truncate text-xs font-semibold uppercase tracking-wider ${activeCategory === item.categorie ? "text-zinc-600" : "text-zinc-600"}`}>{item.categorie}</p><div className="mt-3 flex items-end justify-between"><p className="text-2xl font-bold">{item.progress}%</p><p className="text-xs opacity-60">{item.done}/{item.total}</p></div></button>)}</section>}

      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="text-2xl font-bold">Checklist de sortie</h2><p className="mt-1 text-sm text-zinc-600">{visibleTasks.length} action{visibleTasks.length > 1 ? "s" : ""} affichée{visibleTasks.length > 1 ? "s" : ""}</p></div><select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none"><option>Toutes</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>

        {tasks.length === 0 && (
          <p className="text-zinc-500">
            Aucune checklist générée pour cette sortie.
          </p>
        )}

        <div className="divide-y divide-zinc-900">
          {visibleTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task)}
              className={`w-full p-5 text-left transition hover:bg-black sm:p-6 ${
                task.statut === "Terminé"
                  ? "bg-emerald-500/[0.04]"
                  : "bg-transparent"
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

                <span className={`rounded-full border px-3 py-1 text-xs ${task.statut === "Terminé" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 text-zinc-400"}`}>{task.statut}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
