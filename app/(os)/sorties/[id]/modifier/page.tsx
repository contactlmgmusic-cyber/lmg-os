"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ModifierSortiePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const { data: sortie, error } = await supabaseBrowser
        .from("sorties")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !sortie) {
        alert(error?.message || "Sortie introuvable.");
        router.push("/sorties");
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

      setTitre(sortie.titre || "");
      setType(sortie.type || "Single");
      setStatut(sortie.statut || "En préparation");
      setArtisteId(sortie.artiste_id || "");
      setProjetId(sortie.projet_id || "");
      setDateSortie(sortie.date_sortie || "");
      setUpc(sortie.upc || "");
      setIsrc(sortie.isrc || "");
      setSpotifyUrl(sortie.spotify_url || "");
      setAppleMusicUrl(sortie.apple_music_url || "");
      setDeezerUrl(sortie.deezer_url || "");
      setYoutubeUrl(sortie.youtube_url || "");
      setSoundcloudUrl(sortie.soundcloud_url || "");
      setCoverUrl(sortie.cover_url || "");
      setNotes(sortie.notes || "");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
      setLoading(false);
    }

    if (id) loadData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("sorties")
      .update({
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
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/sorties/${id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette sortie ?")) return;

    const { error } = await supabaseBrowser
      .from("sorties")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/sorties");
    router.refresh();
  }

  if (loading) {
    return <main className="min-h-screen bg-black p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href={`/sorties/${id}`} className="text-sm text-zinc-400 hover:text-white">
        ← Retour sortie
      </Link>

      <h1 className="mt-6 text-5xl font-bold">Modifier sortie</h1>

      <form onSubmit={handleSubmit} className="mt-10 max-w-5xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-4">
            <option>Single</option><option>EP</option><option>Album</option><option>Mixtape</option><option>Clip</option>
          </select>

          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-4">
            <option>En préparation</option><option>Envoyée distribution</option><option>Planifiée</option><option>Sortie</option><option>Archivée</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <select value={artisteId} onChange={(e) => setArtisteId(e.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-4">
            <option value="">Aucun artiste lié</option>
            {artistes.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>

          <select value={projetId} onChange={(e) => setProjetId(e.target.value)} className="rounded-xl border border-zinc-800 bg-black px-4 py-4">
            <option value="">Aucun projet lié</option>
            {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </select>
        </div>

        <input type="date" value={dateSortie} onChange={(e) => setDateSortie(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={isrc} onChange={(e) => setIsrc(e.target.value)} placeholder="ISRC" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="URL cover" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <input value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Spotify" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={appleMusicUrl} onChange={(e) => setAppleMusicUrl(e.target.value)} placeholder="Apple Music" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={deezerUrl} onChange={(e) => setDeezerUrl(e.target.value)} placeholder="Deezer" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        <input value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} placeholder="SoundCloud" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <button disabled={saving} className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>

        <button type="button" onClick={handleDelete} className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 font-medium text-red-400">
          Supprimer la sortie
        </button>
      </form>
    </main>
  );
}