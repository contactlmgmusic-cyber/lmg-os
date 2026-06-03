"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function ModifierMediaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("Playlist");
  const [plateforme, setPlateforme] = useState("");
  const [contactNom, setContactNom] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [url, setUrl] = useState("");
  const [audience, setAudience] = useState("");
  const [priorite, setPriorite] = useState("Normale");
  const [prochaineRelance, setProchaineRelance] = useState("");
  const [statut, setStatut] = useState("À contacter");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [notes, setNotes] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: media, error } = await supabaseBrowser
        .from("medias")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !media) {
        alert(error?.message || "Contact média introuvable.");
        router.push("/medias");
        return;
      }

      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      setNom(media.nom || "");
      setType(media.type || "Playlist");
      setPlateforme(media.plateforme || "");
      setContactNom(media.contact_nom || "");
      setEmail(media.email || "");
      setInstagram(media.instagram || "");
      setTelephone(media.telephone || "");
      setVille(media.ville || "");
      setPays(media.pays || "");
      setUrl(media.url || "");
      setAudience(media.audience ? String(media.audience) : "");
      setPriorite(media.priorite || "Normale");
      setProchaineRelance(media.prochaine_relance || "");
      setStatut(media.statut || "À contacter");
      setArtisteId(media.artiste_id || "");
      setProjetId(media.projet_id || "");
      setNotes(media.notes || "");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
      setLoading(false);
    }

    if (id) {
      loadData();
    }
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom du média est obligatoire.");
      return;
    }

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("medias")
      .update({
        nom,
        type,
        plateforme,
        contact_nom: contactNom,
        email,
        instagram,
        telephone,
        ville,
        pays,
        url,
        audience: audience ? Number(audience) : null,
        priorite,
        prochaine_relance: prochaineRelance || null,
        statut,
        artiste_id: artisteId || null,
        projet_id: projetId || null,
        notes,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/medias/${id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <Link href={`/medias/${id}`} className="text-zinc-400 hover:text-white">
          ← Retour au contact média
        </Link>

        <h1 className="mt-6 text-5xl font-bold">Modifier contact média</h1>

        <p className="mt-3 text-zinc-400">
          Mets à jour les informations CRM du contact.
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
          required
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

        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Téléphone"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ville"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Pays"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />
        </div>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL du média"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="number"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Audience estimée"
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          />

          <select
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
          >
            <option>Faible</option>
            <option>Normale</option>
            <option>Haute</option>
            <option>Critique</option>
          </select>
        </div>

        <input
          type="date"
          value={prochaineRelance}
          onChange={(e) => setProchaineRelance(e.target.value)}
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
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </main>
  );
}