"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ModifierContratPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [notes, setNotes] = useState("");
  const [fichierUrl, setFichierUrl] = useState("");

  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: contrat } = await supabaseBrowser
        .from("contrats")
        .select("*")
        .eq("id", id)
        .single();

      if (contrat) {
        setTitre(contrat.titre || "");
        setType(contrat.type || "");
        setStatut(contrat.statut || "");
        setNotes(contrat.notes || "");
        setFichierUrl(contrat.fichier_url || "");
        setArtisteId(contrat.artiste_id || "");
        setProjetId(contrat.projet_id || "");
      }

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

      setLoading(false);
    }

    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("contrats")
      .update({
        titre,
        type,
        statut,
        notes,
        fichier_url: fichierUrl || null,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/contrats/${id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Modifier contrat
        </h1>

        <p className="mt-3 text-zinc-400">
          Mettre à jour les informations du contrat.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Contrat artiste</option>
          <option>Contrat booking</option>
          <option>Contrat prestation</option>
          <option>Split sheet</option>
          <option>Contrat producteur</option>
          <option>Autre document</option>
        </select>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Brouillon</option>
          <option>Envoyé</option>
          <option>Signé</option>
          <option>Archivé</option>
        </select>

        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option value="">Aucun artiste</option>

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
          <option value="">Aucun projet</option>

          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <input
          value={fichierUrl}
          onChange={(e) => setFichierUrl(e.target.value)}
          placeholder="URL PDF"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </main>
  );
}