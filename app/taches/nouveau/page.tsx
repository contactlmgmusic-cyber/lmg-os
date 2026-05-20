"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NouvelleTachePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("");
  const [priorite, setPriorite] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projetId, setProjetId] = useState("");
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjets() {
      const { data } = await supabase
        .from("projets")
        .select("*")
        .order("titre", { ascending: true });

      if (data) setProjets(data);
    }

    fetchProjets();
  }, []);

  async function ajouterTache(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("taches").insert({
      titre,
      description: description || null,
      statut: statut || null,
      priorite: priorite || null,
      deadline: deadline || null,
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
      <h1 className="text-4xl font-bold mb-8">Nouvelle tâche</h1>

      <form onSubmit={ajouterTache} className="max-w-xl space-y-5">
        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Titre de la tâche"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <textarea
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Statut</option>
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={priorite}
          onChange={(e) => setPriorite(e.target.value)}
        >
          <option value="">Priorité</option>
          <option value="Haute">Haute</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Basse">Basse</option>
        </select>

        <input
          type="date"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
        >
          <option value="">Lier à un projet</option>

          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-white text-black px-6 py-4 font-semibold hover:bg-zinc-200 transition"
        >
          Créer la tâche
        </button>
      </form>
    </main>
  );
}