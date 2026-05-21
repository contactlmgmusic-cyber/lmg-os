"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";

type Projet = {
  id: string;
  titre: string;
};

export default function NouveauRolloutEventPage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [dateEvent, setDateEvent] = useState("");
  const [notes, setNotes] = useState("");
  const [projetId, setProjetId] = useState("");

  const [projets, setProjets] = useState<Projet[]>([]);

  useEffect(() => {
    async function fetchProjets() {
      const { data } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      setProjets(data || []);
    }

    fetchProjets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("rollout_events")
      .insert({
        titre,
        type,
        statut,
        date_event: dateEvent || null,
        notes,
        projet_id: projetId || null,
      });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/projets");
    router.refresh();
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold">Nouvelle action rollout</h1>
        <p className="mt-2 text-zinc-400">
          Planifier une action promo liée à un projet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de l’action"
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Type d’action</option>
          <option value="Teaser">Teaser</option>
          <option value="Snippet">Snippet</option>
          <option value="Cover reveal">Cover reveal</option>
          <option value="Pre-save">Pre-save</option>
          <option value="Release day">Release day</option>
          <option value="Clip">Clip</option>
          <option value="TikTok">TikTok</option>
          <option value="Instagram">Instagram</option>
          <option value="Shooting">Shooting</option>
          <option value="Interview">Interview</option>
        </select>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Statut</option>
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Programmé">Programmé</option>
          <option value="Publié">Publié</option>
          <option value="Annulé">Annulé</option>
        </select>

        <input
          type="date"
          value={dateEvent}
          onChange={(e) => setDateEvent(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Sélectionner un projet</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes / brief / consignes..."
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
        >
          Créer l’action rollout
        </button>
      </form>
    </main>
  );
}