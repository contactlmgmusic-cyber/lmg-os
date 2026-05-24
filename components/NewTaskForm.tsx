"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Profile = {
  id: string;
  nom: string | null;
};

type Projet = {
  id: string;
  titre: string | null;
};

export default function NewTaskForm({
  profiles,
  projets,
}: {
  profiles: Profile[];
  projets: Projet[];
}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("À faire");
  const [priorite, setPriorite] = useState("Moyenne");
  const [deadline, setDeadline] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [projetId, setProjetId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser.from("taches").insert({
      titre,
      description,
      statut,
      priorite,
      deadline: deadline || null,
      responsable_id: responsableId || null,
      projet_id: projetId || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Tâche",
      titre: "Nouvelle tâche créée",
      description: titre,
    });

    window.location.href = "/taches";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
    >
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Titre"
        required
        className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
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
        <option value="">Aucun responsable</option>

        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.nom || "Membre LMG"}
          </option>
        ))}
      </select>

      <select
        value={projetId}
        onChange={(e) => setProjetId(e.target.value)}
        className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white"
      >
        <option value="">Aucun projet lié</option>

        {projets.map((projet) => (
          <option key={projet.id} value={projet.id}>
            {projet.titre || "Projet sans titre"}
          </option>
        ))}
      </select>

      <button className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black">
        Créer la tâche
      </button>
    </form>
  );
}