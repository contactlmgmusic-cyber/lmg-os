"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NouveauProjetPage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [budgetPromo, setBudgetPromo] = useState("");
  const [notes, setNotes] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [artistes, setArtistes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchArtistes() {
      const { data } = await supabase
        .from("artistes")
        .select("*")
        .order("nom", { ascending: true });

      if (data) setArtistes(data);
    }

    fetchArtistes();
  }, []);

  async function ajouterProjet(e: React.FormEvent) {
    e.preventDefault();

    let coverUrl = "";

    if (cover) {
      const fileName = `${Date.now()}-${cover.name}`;

      const { error: uploadError } = await supabase.storage
        .from("project-covers")
        .upload(fileName, cover);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("project-covers")
        .getPublicUrl(fileName);

      coverUrl = data.publicUrl;
    }

    const { error } = await supabase.from("projets").insert({
      titre,
      type: type || null,
      statut: statut || null,
      date_sortie: dateSortie || null,
      budget_promo: budgetPromo ? Number(budgetPromo) : null,
      notes: notes || null,
      artiste_id: artisteId || null,
      cover_url: coverUrl || null,
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
      <h1 className="text-4xl font-bold mb-8">Nouveau projet</h1>

      <form onSubmit={ajouterProjet} className="max-w-xl space-y-5">
        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Titre du projet"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Type de projet</option>
          <option value="Single">Single</option>
          <option value="EP">EP</option>
          <option value="Album">Album</option>
          <option value="Clip">Clip</option>
          <option value="Freestyle">Freestyle</option>
          <option value="Live session">Live session</option>
        </select>

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Statut</option>
          <option value="Idée">Idée</option>
          <option value="En préparation">En préparation</option>
          <option value="Enregistrement">Enregistrement</option>
          <option value="Mix / Master">Mix / Master</option>
          <option value="Promo">Promo</option>
          <option value="Sorti">Sorti</option>
        </select>

        <input
          type="date"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={dateSortie}
          onChange={(e) => setDateSortie(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Budget promo"
          value={budgetPromo}
          onChange={(e) => setBudgetPromo(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
        >
          <option value="">Sélectionner un artiste</option>

          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          onChange={(e) => setCover(e.target.files?.[0] || null)}
        />

        <textarea
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          type="submit"
          className="rounded-xl bg-white text-black px-6 py-4 font-semibold hover:bg-zinc-200 transition"
        >
          Créer le projet
        </button>
      </form>
    </main>
  );
}