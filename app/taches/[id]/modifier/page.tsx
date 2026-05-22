"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

export default function ModifierTachePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState("");
  const [priorite, setPriorite] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    async function fetchTache() {
      const { data, error } = await supabaseBrowser
        .from("taches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setTitre(data.titre || "");
      setDescription(data.description || "");
      setStatut(data.statut || "");
      setPriorite(data.priorite || "");
      setDeadline(data.deadline || "");
      setLoading(false);
    }

    fetchTache();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabaseBrowser
      .from("taches")
      .update({
        titre,
        description,
        statut,
        priorite,
        deadline: deadline || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/taches/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    const confirmation = confirm(
      "Tu es sûre de vouloir supprimer cette tâche ?"
    );

    if (!confirmation) return;

    const { error } = await supabaseBrowser
      .from("taches")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/taches");
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold">Modifier tâche</h1>
        <p className="mt-2 text-zinc-400">
          Mettre à jour une action de production.
        </p>
      </div>

      <form
        onSubmit={handleUpdate}
        className="max-w-2xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Statut</option>
          <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>

        <select
          value={priorite}
          onChange={(e) => setPriorite(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        >
          <option value="">Priorité</option>
          <option value="Haute">Haute</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Basse">Basse</option>
        </select>

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black transition hover:opacity-90"
        >
          Enregistrer
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 font-medium text-red-400 transition hover:bg-red-500/20"
        >
          Supprimer la tâche
        </button>
      </form>
    </main>
  );
}