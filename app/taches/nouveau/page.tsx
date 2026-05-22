"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";

type Profile = {
  id: string;
  nom: string;
};

export default function NouvelleTachePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("À faire");
  const [priorite, setPriorite] = useState("Moyenne");
  const [deadline, setDeadline] = useState("");
  const [responsableId, setResponsableId] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabaseBrowser
        .from("profiles")
        .select("id, nom")
        .order("nom");

      setProfiles(data || []);
    }

    fetchProfiles();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("taches")
      .insert({
        titre,
        description,
        statut,
        priorite,
        deadline: deadline || null,
        responsable_id: responsableId || null,
      });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/taches";
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Nouvelle tâche
        </h1>

        <p className="mt-3 text-zinc-400">
          Créer et assigner une tâche équipe.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          type="text"
          placeholder="Titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-40 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option>À faire</option>
            <option>En cours</option>
            <option>Terminé</option>
          </select>

          <select
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          >
            <option>Basse</option>
            <option>Moyenne</option>
            <option>Haute</option>
          </select>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-black p-4 text-white"
          />
        </div>

        <select
          value={responsableId}
          onChange={(e) => setResponsableId(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">
            Aucun responsable
          </option>

          {profiles.map((profile) => (
            <option
              key={profile.id}
              value={profile.id}
            >
              {profile.nom}
            </option>
          ))}
        </select>

        <button className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-zinc-200">
          Créer la tâche
        </button>
      </form>
    </main>
  );
}