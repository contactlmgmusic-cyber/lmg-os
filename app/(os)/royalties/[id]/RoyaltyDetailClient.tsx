"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RoyaltyDetailClient({ initialRoyalty, canPay }: { initialRoyalty: any; canPay: boolean }) {
  const router = useRouter();
  const id = initialRoyalty.id as string;

  const [royalty, setRoyalty] = useState<any>(initialRoyalty);
  const [saving, setSaving] = useState(false);

  const [datePaiement, setDatePaiement] = useState("");
  const [methodePaiement, setMethodePaiement] = useState("");
  const [referencePaiement, setReferencePaiement] = useState("");
  const [notesPaiement, setNotesPaiement] = useState("");

  useEffect(() => {
    setRoyalty(initialRoyalty);
    setDatePaiement(initialRoyalty.date_paiement || "");
    setMethodePaiement(initialRoyalty.methode_paiement || "");
    setReferencePaiement(initialRoyalty.reference_paiement || "");
    setNotesPaiement(initialRoyalty.notes_paiement || "");
  }, [initialRoyalty]);

  async function markAsPaid(e: React.FormEvent) {
  e.preventDefault();
  if (!canPay) return;

  if (royalty?.statut === "Payé") {
    alert("Cette royalty est déjà marquée comme payée.");
    return;
  }

  const confirmed = window.confirm(
    `Confirmer le paiement de ${Number(royalty.montant_du || 0).toFixed(
      2
    )} € à ${royalty.nom} ?`
  );

  if (!confirmed) return;

  setSaving(true);

  const finalDatePaiement =
    datePaiement || new Date().toISOString().split("T")[0];

  const response = await fetch(`/api/royalties/${encodeURIComponent(id)}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date_paiement: finalDatePaiement,
      methode_paiement: methodePaiement || null,
      reference_paiement: referencePaiement || null,
      notes_paiement: notesPaiement || null,
    }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    alert(result.error || "Impossible d'enregistrer le paiement.");
    setSaving(false);
    return;
  }
  setRoyalty((current: any) => ({ ...current, statut: "Payé", date_paiement: finalDatePaiement, methode_paiement: methodePaiement, reference_paiement: referencePaiement, notes_paiement: notesPaiement }));
  setSaving(false);
  router.refresh();
}

  if (!royalty) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Royalty introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/royalties" className="text-sm text-zinc-400 hover:text-white">
        ← Retour royalties
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Royalty
          </p>

          <h1 className="mt-3 text-5xl font-bold">{royalty.nom}</h1>

          <p className="mt-6 text-5xl font-bold text-green-400">
            {Number(royalty.montant_du || 0).toFixed(2)} €
          </p>

          <span
            className={`mt-6 inline-block rounded-full px-4 py-2 text-sm ${
              royalty.statut === "Payé"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {royalty.statut || "À payer"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Projet" value={royalty.projets?.titre || "Non lié"} />
            <Info label="Rôle" value={royalty.role || "Non renseigné"} />
            <Info label="Email" value={royalty.email || "Non renseigné"} />
            <Info label="Pourcentage" value={`${royalty.pourcentage || 0}%`} />
            <Info
              label="Revenu total"
              value={`${Number(royalty.revenu_total || 0).toFixed(2)} €`}
            />
            <Info
              label="Montant dû"
              value={`${Number(royalty.montant_du || 0).toFixed(2)} €`}
            />
          </div>

          {royalty.statut === "Payé" && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
              <h2 className="text-2xl font-bold">Paiement</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Info label="Date paiement" value={royalty.date_paiement || "Non renseignée"} />
                <Info label="Méthode" value={royalty.methode_paiement || "Non renseignée"} />
                <Info label="Référence" value={royalty.reference_paiement || "Non renseignée"} />
                <Info label="Notes" value={royalty.notes_paiement || "Aucune note"} />
              </div>
            </div>
          )}
        </section>

        {canPay && <aside className="space-y-6">
  <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
    <h2 className="text-3xl font-bold">Marquer comme payé</h2>

            <form onSubmit={markAsPaid} className="mt-6 space-y-4">
              <input
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
              />

              <input
                value={methodePaiement}
                onChange={(e) => setMethodePaiement(e.target.value)}
                placeholder="Méthode de paiement"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
              />

              <input
                value={referencePaiement}
                onChange={(e) => setReferencePaiement(e.target.value)}
                placeholder="Référence virement"
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
              />

              <textarea
                value={notesPaiement}
                onChange={(e) => setNotesPaiement(e.target.value)}
                placeholder="Notes paiement"
                className="min-h-32 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Confirmer paiement"}
              </button>
            </form>
          </section>
        </aside>}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
