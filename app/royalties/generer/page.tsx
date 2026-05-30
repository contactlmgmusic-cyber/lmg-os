"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function GenererRoyaltiesPage() {
  const [splits, setSplits] = useState<any[]>([]);
  const [splitId, setSplitId] = useState("");
  const [revenuTotal, setRevenuTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSplits() {
      const { data } = await supabaseBrowser
        .from("splits")
        .select(`
          *,
          projets ( id, titre ),
          split_participants (
            id,
            nom,
            role,
            email,
            pourcentage
          )
        `)
        .order("created_at", { ascending: false });

      setSplits(data || []);
    }

    loadSplits();
  }, []);

  async function generateRoyalties() {
    setLoading(true);
    setMessage("");

    const split = splits.find((s) => s.id === splitId);

    if (!split) {
      setMessage("Choisis un split sheet.");
      setLoading(false);
      return;
    }

    if (!revenuTotal || Number(revenuTotal) <= 0) {
      setMessage("Ajoute un revenu total valide.");
      setLoading(false);
      return;
    }

    const participants = split.split_participants || [];

    const total = participants.reduce(
      (acc: number, p: any) => acc + Number(p.pourcentage || 0),
      0
    );

    if (total !== 100) {
      setMessage(`Impossible : le total du split est de ${total}%, pas 100%.`);
      setLoading(false);
      return;
    }

    const revenu = Number(revenuTotal);

    const rows = participants.map((p: any) => ({
      projet_id: split.projet_id,
      split_id: split.id,
      participant_id: p.id,
      nom: p.nom,
      role: p.role,
      email: p.email,
      revenu_total: revenu,
      pourcentage: Number(p.pourcentage || 0),
      montant_du: (revenu * Number(p.pourcentage || 0)) / 100,
      statut: "À payer",
    }));

    const { error } = await supabaseBrowser.from("royalties").insert(rows);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Royalties générées avec succès.");
    setRevenuTotal("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Royalties
        </p>

        <h1 className="text-5xl font-bold">Générer royalties</h1>

        <p className="mt-3 text-zinc-400">
          Calcule automatiquement les montants dus à partir d’un split sheet.
        </p>
      </div>

      <div className="max-w-3xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <select
          value={splitId}
          onChange={(e) => setSplitId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        >
          <option value="">Choisir un split sheet</option>

          {splits.map((split) => (
            <option key={split.id} value={split.id}>
              {split.titre} — {split.projets?.titre || "Projet non lié"}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={revenuTotal}
          onChange={(e) => setRevenuTotal(e.target.value)}
          placeholder="Revenu total à répartir"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
        />

        <button
          onClick={generateRoyalties}
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Génération..." : "Générer les royalties"}
        </button>

        {message && (
          <p className="rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}