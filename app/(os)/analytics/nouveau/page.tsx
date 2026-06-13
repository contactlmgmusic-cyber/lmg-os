"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouveauAnalyticsPage() {
  const router = useRouter();

  const [plateforme, setPlateforme] = useState("Spotify");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [sortieId, setSortieId] = useState("");
  const [streams, setStreams] = useState("");
  const [listeners, setListeners] = useState("");
  const [followers, setFollowers] = useState("");
  const [vues, setVues] = useState("");
  const [revenus, setRevenus] = useState("");
  const [dateSnapshot, setDateSnapshot] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);
  const [sorties, setSorties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  async function loadData() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== ROLES.SUPER_ADMIN &&
      profile?.role !== ROLES.ADMIN &&
      profile?.role !== ROLES.MANAGER
    ) {
      window.location.href = "/";
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

    const { data: sortiesData } = await supabaseBrowser
      .from("sorties")
      .select("id, titre")
      .order("titre");

    setArtistes(artistesData || []);
    setProjets(projetsData || []);
    setSorties(sortiesData || []);
  }

  loadData();
}, []);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  const { error } = await supabaseBrowser.from("analytics").insert({
    plateforme,
    artiste_id: artisteId || null,
    projet_id: projetId || null,
    sortie_id: sortieId || null,
    streams: streams ? Number(streams) : 0,
    listeners: listeners ? Number(listeners) : 0,
    followers: followers ? Number(followers) : 0,
    vues: vues ? Number(vues) : 0,
    revenus: revenus ? Number(revenus) : 0,
    date_snapshot: dateSnapshot || new Date().toISOString().split("T")[0],
  });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/analytics");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-5xl font-bold">Nouveau snapshot analytics</h1>

      <form onSubmit={handleSubmit} className="mt-10 max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <select value={plateforme} onChange={(e) => setPlateforme(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4">
          <option>Spotify</option>
          <option>Apple Music</option>
          <option>YouTube</option>
          <option>TikTok</option>
          <option>Deezer</option>
          <option>SoundCloud</option>
          <option>Instagram</option>
        </select>

        <select value={artisteId} onChange={(e) => setArtisteId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4">
          <option value="">Aucun artiste lié</option>
          {artistes.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
        </select>

        <select value={projetId} onChange={(e) => setProjetId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4">
          <option value="">Aucun projet lié</option>
          {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
        </select>

        <select value={sortieId} onChange={(e) => setSortieId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4">
          <option value="">Aucune sortie liée</option>
          {sorties.map((s) => <option key={s.id} value={s.id}>{s.titre}</option>)}
        </select>

        <input type="date" value={dateSnapshot} onChange={(e) => setDateSnapshot(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input type="number" value={streams} onChange={(e) => setStreams(e.target.value)} placeholder="Streams" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input type="number" value={listeners} onChange={(e) => setListeners(e.target.value)} placeholder="Auditeurs" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Followers" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
          <input type="number" value={vues} onChange={(e) => setVues(e.target.value)} placeholder="Vues" className="rounded-xl border border-zinc-800 bg-black px-4 py-4" />
        </div>

        <input type="number" value={revenus} onChange={(e) => setRevenus(e.target.value)} placeholder="Revenus générés (€)" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4" />

        <button disabled={loading} className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black">
          {loading ? "Création..." : "Créer le snapshot"}
        </button>
      </form>
    </main>
  );
}