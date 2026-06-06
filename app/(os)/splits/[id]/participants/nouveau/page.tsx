"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouveauParticipantPage() {
  const params = useParams();
  const router = useRouter();

  const splitId = params.id as string;

  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState("");
  const [role, setRole] = useState("Auteur");
  const [pourcentage, setPourcentage] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabaseBrowser
      .from("split_participants")
      .insert({
        split_id: splitId,
        nom,
        role,
        pourcentage: Number(pourcentage),
        email,
      });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/splits/${splitId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Royalties
        </p>

        <h1 className="text-5xl font-bold">
          Ajouter un participant
        </h1>

        <p className="mt-3 text-zinc-400">
          Auteur, compositeur, producteur ou beatmaker.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du participant"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option>Auteur</option>
          <option>Compositeur</option>
          <option>Producteur</option>
          <option>Beatmaker</option>
          <option>Interprète</option>
        </select>

        <input
          required
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={pourcentage}
          onChange={(e) => setPourcentage(e.target.value)}
          placeholder="% de répartition"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optionnel)"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Ajouter participant"}
        </button>
      </form>
    </main>
  );
}