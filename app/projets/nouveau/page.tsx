"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";
import UploadCover from "../../../components/UploadCover";

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