"use client";

import { useEffect, useMemo, useState } from "react";
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

  const selectedSplit = useMemo(
    () => splits.find((split) => split.id === splitId),
    [splits, splitId]
  );

  const participants = selectedSplit?.split_participants || [];

  const totalPourcentage = participants.reduce(
    (acc: number, participant: any) =>
      acc + Number(participant.pourcentage || 0),
    0
  );

  const revenu = Number(revenuTotal || 0);

  async function generateRoyalties() {
    setLoading(true);
    setMessage("");

    if (!selectedSplit) {
      setMessage("Choisis un split sheet.");
      setLoading(false);
      return;
    }

    if (!revenu || revenu <= 0) {
      setMessage("Ajoute un revenu total valide.");
      setLoading(false);
      return;
    }

    if (participants.length === 0) {
      setMessage("Impossible : aucun participant sur ce split sheet.");
      setLoading(false);
      return;
    }

    if (totalPourcentage !== 100) {
      setMessage(
        `Impossible : le total du split est de ${totalPourcentage}%, pas 100%.`
      );
      setLoading(false);
      return;
    }

    const confirmed = window.confirm(
      `Générer les royalties pour ${selectedSplit.titre} sur ${revenu.toFixed(
        2
      )} € ?`
    );

    if (!confirmed) {
      setLoading(false);
      return;
    }

    const { data: existingRoyalties } = await supabaseBrowser
      .from("royalties")
      .select("id")
      .eq("split_id", selectedSplit.id)
      .limit(1);

    if (existingRoyalties && existingRoyalties.length > 0) {
      setMessage(
        "Des royalties existent déjà pour ce split sheet. Supprime-les ou crée une nouvelle période avant de régénérer."
      );
      setLoading(false);
      return;
    }

    const rows = participants.map((participant: any) => ({
      projet_id: selectedSplit.projet_id,
      split_id: selectedSplit.id,
      participant_id: participant.id,
      nom: participant.nom,
      role: participant.role,
      email: participant.email,
      revenu_total: revenu,
      pourcentage: Number(participant.pourcentage || 0),
      montant_du:
        (revenu * Number(participant.pourcentage || 0)) / 100,
      statut: "À payer",
    }));

    const { error } = await supabaseBrowser
      .from("royalties")
      .insert(rows);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Royalties",
      titre: "Royalties générées",
      description: `${selectedSplit.titre} • ${revenu.toFixed(2)} €`,
    });

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

        <h1 className="text-5xl font-bold">
          Générer royalties
        </h1>

        <p className="mt-3 text-zinc-400">
          Calcule automatiquement les montants dus à partir d’un split sheet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <select
            value={splitId}
            onChange={(e) => {
              setSplitId(e.target.value);
              setMessage("");
            }}
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
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Aperçu répartition
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {selectedSplit?.titre || "Aucun split sélectionné"}
              </p>
            </div>

            <span
              className={`rounded-full border px-4 py-2 text-sm ${
                totalPourcentage === 100
                  ? "border-green-500/40 text-green-300"
                  : "border-red-500/40 text-red-300"
              }`}
            >
              Total : {totalPourcentage}%
            </span>
          </div>

          {participants.length === 0 && (
            <p className="text-zinc-500">
              Aucun participant à afficher.
            </p>
          )}

          <div className="space-y-4">
            {participants.map((participant: any) => {
              const amount =
                revenu > 0
                  ? (revenu * Number(participant.pourcentage || 0)) / 100
                  : 0;

              return (
                <div
                  key={participant.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {participant.nom}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {participant.role || "Participant"} •{" "}
                        {participant.email || "Email non renseigné"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {Number(participant.pourcentage || 0)}%
                      </p>

                      <p className="mt-1 text-sm text-green-300">
                        {amount.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}