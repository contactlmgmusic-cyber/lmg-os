"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouveauMediaPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [type, setType] = useState("Playlist");
  const [plateforme, setPlateforme] = useState("");
  const [contactNom, setContactNom] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [statut, setStatut] = useState("À contacter");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");

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

    if (!nom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser
      .from("medias")
      .insert({
        nom,
        type,
        plateforme,
        contact_nom: contactNom,
        email,
        instagram,
        statut,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
        notes,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/medias");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Nouveau contact média
        </h1>

        <p className="mt-3 text-zinc-400">
          Ajouter une playlist, radio, blog, journaliste ou influenceur.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du média"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Playlist</option>
          <option>Radio</option>
          <option>Blog</option>
          <option>Journaliste</option>
          <option>Influenceur</option>
          <option>TikToker</option>
          <option>YouTubeur</option>
        </select>

        <input
          value={plateforme}
          onChange={(e) => setPlateforme(e.target.value)}
          placeholder="Spotify, Instagram, TikTok, YouTube..."
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <input
          value={contactNom}
          onChange={(e) => setContactNom(e.target.value)}
          placeholder="Nom du contact"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>À contacter</option>
          <option>Contacté</option>
          <option>Relancé</option>
          <option>Intéressé</option>
          <option>Publié</option>
          <option>Refusé</option>
        </select>

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

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le contact"}
        </button>
      </form>
    </main>
  );
}