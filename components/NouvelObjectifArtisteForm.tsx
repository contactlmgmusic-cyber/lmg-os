"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";

export default function NouvelObjectifArtisteForm() {
  const router = useRouter();

  const [artistes, setArtistes] = useState<any[]>([]);
  const [artisteId, setArtisteId] = useState("");
  const [periode, setPeriode] = useState("2026");
  const [streams, setStreams] = useState("");
  const [followers, setFollowers] = useState("");
  const [bookings, setBookings] = useState("");
  const [sorties, setSorties] = useState("");
  const [notes, setNotes] = useState("");
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

      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(data || []);
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!artisteId) {
      alert("Sélectionne un artiste.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("artiste_objectifs").insert({
      artiste_id: artisteId,
      periode,
      streams_objectif: Number(streams || 0),
      followers_objectif: Number(followers || 0),
      bookings_objectif: Number(bookings || 0),
      sorties_objectif: Number(sorties || 0),
      notes: notes || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/objectifs-artistes");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvel objectif artiste</h1>

        <p className="mt-3 text-zinc-400">
          Définis les objectifs de développement d’un artiste.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Choisir un artiste</option>

          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <input
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          placeholder="Période ex : 2026"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input
            type="number"
            value={streams}
            onChange={(e) => setStreams(e.target.value)}
            placeholder="Objectif streams"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            type="number"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="Objectif followers"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            type="number"
            value={bookings}
            onChange={(e) => setBookings(e.target.value)}
            placeholder="Objectif bookings"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />

          <input
            type="number"
            value={sorties}
            onChange={(e) => setSorties(e.target.value)}
            placeholder="Objectif sorties"
            className="rounded-xl border border-zinc-800 bg-black px-4 py-4"
          />
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes internes"
          className="min-h-36 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer objectif"}
        </button>
      </form>
    </main>
  );
}