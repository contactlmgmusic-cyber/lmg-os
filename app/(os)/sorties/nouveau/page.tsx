"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouvelleSortiePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Single");
  const [statut, setStatut] = useState("En préparation");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [upc, setUpc] = useState("");
  const [isrc, setIsrc] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [appleMusicUrl, setAppleMusicUrl] = useState("");
  const [deezerUrl, setDeezerUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {

const {
  data: { user },
} = await supabaseBrowser.auth.getUser();

if (!user) {
  router.push("/login");
  return;
}

const { data: profile } = await supabaseBrowser
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (
  profile?.role !== "super_admin" &&
  profile?.role !== "admin"
) {
  router.push("/");
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

    const { error } = await supabaseBrowser.from("sorties").insert({
      titre,
      type,
      statut,
      artiste_id: artisteId || null,
      projet_id: projetId || null,
      date_sortie: dateSortie || null,
      upc: upc || null,
      isrc: isrc || null,
      spotify_url: spotifyUrl || null,
      apple_music_url: appleMusicUrl || null,
      deezer_url: deezerUrl || null,
      youtube_url: youtubeUrl || null,
      soundcloud_url: soundcloudUrl || null,
      cover_url: coverUrl || null,
      notes: notes || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/sorties");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle sortie</h1>
        <p className="mt-3 text-zinc-400">
          Ajoute un single, EP, album, clip ou release distribuée.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre de la sortie"
          required
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option>Single</option>
            <option>EP</option>
            <option>Album</option>
            <option>Mixtape</option>
            <option>Clip</option>
          </select>

          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          >
            <option>En préparation</option>
            <option>Envoyée distribution</option>
            <option>Planifiée</option>
            <option>Sortie</option>
            <option>Archivée</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <select
            value={artisteId}
            onChange={(e) => setArtisteId(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
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
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
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
          type="date"
          value={dateSortie}
          onChange={(e) => setDateSortie(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input value={isrc} onChange={(e) => setIsrc(e.target.value)} placeholder="ISRC" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        </div>

        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="URL cover" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Lien Spotify" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input value={appleMusicUrl} onChange={(e) => setAppleMusicUrl(e.target.value)} placeholder="Lien Apple Music" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input value={deezerUrl} onChange={(e) => setDeezerUrl(e.target.value)} placeholder="Lien Deezer" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="Lien YouTube" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} placeholder="Lien SoundCloud" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes internes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la sortie"}
        </button>
      </form>
    </main>
  );
}