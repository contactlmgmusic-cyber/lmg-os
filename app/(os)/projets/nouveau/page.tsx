"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import UploadCover from "../../../../components/UploadCover";

type Artiste = {
  id: string;
  nom: string;
};

export default function NouveauProjetPage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [notes, setNotes] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [artisteId, setArtisteId] = useState("");

  const [artistes, setArtistes] = useState<Artiste[]>([]);

  useEffect(() => {
    async function fetchArtistes() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(data || []);
    }

    fetchArtistes();
  }, []);

  function addDays(baseDate: string, days: number) {
  if (!baseDate) return null;

  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
}

function getRolloutTasks(projectTitle: string, releaseDate: string) {
  return [
    {
      titre: `Valider la cover - ${projectTitle}`,
      description: "Préparer et valider la cover officielle du projet.",
      priorite: "Haute",
      deadline: addDays(releaseDate, -21),
    },
    {
      titre: `Uploader distribution DSP - ${projectTitle}`,
      description: "Uploader le projet sur le distributeur musical.",
      priorite: "Haute",
      deadline: addDays(releaseDate, -14),
    },
    {
      titre: `Créer teaser J-14 - ${projectTitle}`,
      description: "Préparer un teaser court pour Instagram, TikTok et Reels.",
      priorite: "Moyenne",
      deadline: addDays(releaseDate, -14),
    },
    {
      titre: `Préparer pré-save - ${projectTitle}`,
      description: "Créer ou récupérer le lien de pré-save.",
      priorite: "Moyenne",
      deadline: addDays(releaseDate, -10),
    },
    {
      titre: `Créer teaser J-7 - ${projectTitle}`,
      description: "Préparer un extrait court à publier 7 jours avant la sortie.",
      priorite: "Moyenne",
      deadline: addDays(releaseDate, -7),
    },
    {
      titre: `Préparer stories countdown - ${projectTitle}`,
      description: "Préparer les stories de compte à rebours.",
      priorite: "Basse",
      deadline: addDays(releaseDate, -3),
    },
    {
      titre: `Publication sortie - ${projectTitle}`,
      description: "Publier les contenus le jour de la sortie.",
      priorite: "Haute",
      deadline: releaseDate || null,
    },
    {
      titre: `Relance médias - ${projectTitle}`,
      description: "Relancer médias, playlists, radios et influenceurs.",
      priorite: "Moyenne",
      deadline: addDays(releaseDate, 2),
    },
  ];
}

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const { data: projet, error } = await supabaseBrowser
  .from("projets")
  .insert({
    titre,
    type,
    statut,
    date_sortie: dateSortie || null,
    notes,
    cover_url: coverUrl,
    artiste_id: artisteId || null,
  })
  .select()
  .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (projet) {
  await supabaseBrowser
    .from("chat_channels")
    .insert({
      name: projet.titre,
      slug: projet.titre
        .toLowerCase()
        .replace(/\s+/g, "-"),
      type: "projet",
      projet_id: projet.id,
    });

    if (projet) {
  const rolloutTasks = getRolloutTasks(projet.titre, dateSortie);

  await supabaseBrowser.from("taches").insert(
    rolloutTasks.map((task) => ({
      titre: task.titre,
      description: task.description,
      statut: "À faire",
      priorite: task.priorite,
      deadline: task.deadline,
      projet_id: projet.id,
    }))
  );
}
}

if (projet) {
  const { data: admins } = await supabaseBrowser
    .from("profiles")
    .select("id")
    .in("role", ["admin", "manager"]);

  if (admins && admins.length > 0) {
    await supabaseBrowser.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "projet",
        titre: "Nouveau projet créé",
        description: projet.titre,
        link: `/projets/${projet.id}`,
      }))
    );
  }
}

if (projet && artisteId) {
  const { data: artisteProfile } = await supabaseBrowser
    .from("profiles")
    .select("id")
    .eq("artiste_id", artisteId)
    .single();

  if (artisteProfile) {
    await supabaseBrowser
      .from("notifications")
      .insert({
        user_id: artisteProfile.id,
        type: "projet",
        titre: "Nouveau projet ajouté",
        description: projet.titre,
        link: `/projets/${projet.id}`,
      });
  }
}

    router.push("/projets");
    router.refresh();
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold">
          Nouveau projet
        </h1>

        <p className="mt-2 text-zinc-400">
          Ajouter un single, EP ou album
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre du projet"
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
            required
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option value="">Type de projet</option>
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
            <option value="Mixtape">Mixtape</option>
          </select>

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option value="">Statut rollout</option>
            <option value="En préparation">
              En préparation
            </option>
            <option value="En promo">
              En promo
            </option>
            <option value="Sorti">
              Sorti
            </option>
            <option value="Suspendu">
              Suspendu
            </option>
          </select>

          <select
            value={artisteId}
            onChange={(e) =>
              setArtisteId(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option value="">
              Sélectionner un artiste
            </option>

            {artistes.map((artiste) => (
              <option
                key={artiste.id}
                value={artiste.id}
              >
                {artiste.nom}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateSortie}
            onChange={(e) =>
              setDateSortie(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          />

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Notes rollout / stratégie / promo..."
            className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
          >
            Créer le projet
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Cover du projet
          </h2>

          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Preview cover"
              className="mb-5 aspect-square w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mb-5 flex aspect-square items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
              Preview cover
            </div>
          )}

          <UploadCover onUpload={setCoverUrl} />
        </div>
      </form>
    </main>
  );
}