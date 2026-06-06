"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouvelleCampagnePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [budget, setBudget] = useState("");
  const [statut, setStatut] = useState("En préparation");
  const [objectif, setObjectif] = useState("");
  const [notes, setNotes] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim()) {
      alert("Le titre est obligatoire.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("campagnes").insert({
      titre,
      artiste_id: artisteId || null,
      projet_id: projetId || null,
      budget: budget ? Number(budget) : 0,
      statut,
      objectif,
      notes,
      date_debut: dateDebut || null,
      date_fin: dateFin || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/campagnes");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle campagne</h1>

        <p className="mt-3 text-zinc-400">
          Crée une campagne marketing liée à un artiste, une sortie, des médias
          et des influenceurs.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de la campagne"
          required
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>En préparation</option>
          <option>En cours</option>
          <option>Terminée</option>
          <option>En pause</option>
          <option>Annulée</option>
        </select>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <select
            value={artisteId}
            onChange={(e) => setArtisteId(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="">Aucun artiste lié</option>

            {artistes.map((artiste) => (
              <option key={artiste.id} value={artiste.id}>
                {artiste.nom}
              </option>
            ))}
          </select>

          <select
            value={projetId}
            onChange={(e) => setProjetId(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option value="">Aucun projet lié</option>

            {projets.map((projet) => (
              <option key={projet.id} value={projet.id}>
                {projet.titre}
              </option>
            ))}
          </select>
        </div>

        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget campagne (€)"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <textarea
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          placeholder="Objectif principal : publications, audience, streams..."
          className="min-h-32 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes internes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la campagne"}
        </button>
      </form>
    </main>
  );
}