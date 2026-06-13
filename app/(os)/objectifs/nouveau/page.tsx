"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouvelObjectifPage() {
  const router = useRouter();

  const [artisteId, setArtisteId] = useState("");
  const [type, setType] = useState("Streams");
  const [objectif, setObjectif] = useState("");
  const [actuel, setActuel] = useState("0");
  const [dateLimite, setDateLimite] = useState("");
  const [loading, setLoading] = useState(false);

  const [artistes, setArtistes] = useState<any[]>([]);

  useEffect(() => {
    async function loadArtistes() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(data || []);
    }

    loadArtistes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!artisteId) {
      alert("Sélectionne un artiste.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser
      .from("objectifs_artistes")
      .insert({
        artiste_id: artisteId,
        type,
        objectif: Number(objectif || 0),
        actuel: Number(actuel || 0),
        date_limite: dateLimite || null,
        statut: "En cours",
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/objectifs");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          Nouvel objectif artiste
        </h1>

        <p className="mt-3 text-zinc-400">
          Définis les objectifs de croissance des artistes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
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

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Streams</option>
          <option>Followers</option>
          <option>Vues</option>
          <option>Revenus</option>
          <option>Bookings</option>
          <option>Contrats</option>
        </select>

        <input
          type="number"
          placeholder="Objectif"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <input
          type="number"
          placeholder="Valeur actuelle"
          value={actuel}
          onChange={(e) => setActuel(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <input
          type="date"
          value={dateLimite}
          onChange={(e) => setDateLimite(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black"
        >
          {loading ? "Création..." : "Créer l'objectif"}
        </button>
      </form>
    </main>
  );
}