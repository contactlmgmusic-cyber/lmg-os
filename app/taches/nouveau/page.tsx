"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";

export default function NouvelleTachePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("");
  const [priorite, setPriorite] = useState("");
  const [deadline, setDeadline] = useState("");
  const [responsable, setResponsable] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser.from("taches").insert({
      titre,
      description,
      statut: statut || "À faire",
      priorite,
      deadline: deadline || null,
      responsable: responsable || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/taches");
    router.refresh();
  }

  return (
    <main className="p-10 text-white">
      <h1 className="mb-8 text-5xl font-bold">Nouvelle tâche</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" required className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white" />

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white" />

        <input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Responsable ex : Yli, Joseph, Designer..." className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white" />

        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white">
          <option value="">Statut</option>
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>

        <select value={priorite} onChange={(e) => setPriorite(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white">
          <option value="">Priorité</option>
          <option value="Haute">Haute</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Basse">Basse</option>
        </select>

        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white" />

        <button className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black">
          Créer la tâche
        </button>
      </form>
    </main>
  );
}