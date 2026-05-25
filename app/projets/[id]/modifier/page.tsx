"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

export default function ModifierProjetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchProjet() {
      const { data, error } = await supabaseBrowser
        .from("projets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setTitre(data.titre || "");
      setType(data.type || "");
      setStatut(data.statut || "");
      setDateSortie(data.date_sortie || "");
      setCoverUrl(data.cover_url || "");
      setNotes(data.notes || "");
      setLoading(false);
    }

    fetchProjet();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("projets")
      .update({
        titre,
        type,
        statut,
        date_sortie: dateSortie || null,
        cover_url: coverUrl || null,
        notes,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/projets/${id}`);
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier projet</h1>
        <p className="mt-3 text-zinc-400">
          Mets à jour les informations du projet.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du projet"
          required
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type : Single, EP, Album..."
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Statut</option>
          <option value="Préparation">Préparation</option>
          <option value="Rollout">Rollout</option>
          <option value="Sorti">Sorti</option>
          <option value="Archivé">Archivé</option>
        </select>

        <input
          type="date"
          value={dateSortie}
          onChange={(e) => setDateSortie(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="URL cover"
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes rollout / stratégie"
          className="min-h-40 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <button
          type="submit"
          className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black"
        >
          Enregistrer
        </button>
      </form>
    </main>
  );
}