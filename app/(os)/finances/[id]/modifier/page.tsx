"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ModifierFinancePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Dépense");
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [statut, setStatut] = useState("Prévu");
  const [dateOperation, setDateOperation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadFinance() {
      const { data } = await supabaseBrowser
        .from("finances")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitre(data.titre || "");
        setType(data.type || "Dépense");
        setCategorie(data.categorie || "");
        setMontant(String(data.montant || ""));
        setStatut(data.statut || "Prévu");
        setDateOperation(data.date_operation || "");
        setNotes(data.notes || "");
      }

      setLoading(false);
    }

    loadFinance();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabaseBrowser
      .from("finances")
      .update({
        titre,
        type,
        categorie,
        montant: Number(montant),
        statut,
        date_operation: dateOperation || null,
        notes,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/finances/${id}`);
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier opération</h1>
        <p className="mt-3 text-zinc-400">
          Mettre à jour une dépense ou un revenu LMG.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Revenu</option>
          <option>Dépense</option>
        </select>

        <input
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          placeholder="Catégorie"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant"
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option>Prévu</option>
          <option>Facturé</option>
          <option>Payé</option>
          <option>Annulé</option>
        </select>

        <input
          type="date"
          value={dateOperation}
          onChange={(e) => setDateOperation(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

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
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}