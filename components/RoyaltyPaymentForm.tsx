"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type RoyaltyPayment = {
  id: string; nom: string; montantDu: number; statut: string;
  datePaiement: string; methodePaiement: string; referencePaiement: string; notesPaiement: string;
};

export default function RoyaltyPaymentForm({ royalty }: { royalty: RoyaltyPayment }) {
  const router = useRouter();
  const [datePaiement, setDatePaiement] = useState(royalty.datePaiement);
  const [methodePaiement, setMethodePaiement] = useState(royalty.methodePaiement);
  const [referencePaiement, setReferencePaiement] = useState(royalty.referencePaiement);
  const [notesPaiement, setNotesPaiement] = useState(royalty.notesPaiement);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const paid = royalty.statut === "Payé";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (paid) return;
    if (!datePaiement || !methodePaiement.trim() || !referencePaiement.trim()) {
      setMessage("Renseigne la date, la méthode et la référence du paiement.");
      return;
    }
    if (!window.confirm(`Confirmer le paiement de ${euros(royalty.montantDu)} à ${royalty.nom} ? Cette action enregistrera le règlement.`)) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabaseBrowser.from("royalties").update({
      statut: "Payé", date_paiement: datePaiement, methode_paiement: methodePaiement.trim(),
      reference_paiement: referencePaiement.trim(), notes_paiement: notesPaiement.trim() || null,
    }).eq("id", royalty.id);
    if (error) { setMessage(error.message); setSaving(false); return; }
    await supabaseBrowser.from("activity_logs").insert({ type: "Royalties", titre: "Royalty payée", description: `${royalty.nom} • ${euros(royalty.montantDu)} • Réf. ${referencePaiement.trim()}` });
    setMessage("Paiement enregistré.");
    setSaving(false);
    router.refresh();
  }

  return <section className="sticky top-6 rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Règlement</p><h2 className="mt-2 text-2xl font-bold">{paid ? "Paiement confirmé" : "Confirmer le paiement"}</h2>
    <p className="mt-2 text-sm leading-6 text-zinc-500">{paid ? "Cette royalty est déjà soldée. Les données sont conservées pour la traçabilité." : "La date, la méthode et la référence sont obligatoires avant confirmation."}</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label="Date du paiement"><input type="date" value={datePaiement} onChange={(e) => setDatePaiement(e.target.value)} disabled={paid} className="field" /></Field>
      <Field label="Méthode de paiement"><select value={methodePaiement} onChange={(e) => setMethodePaiement(e.target.value)} disabled={paid} className="field"><option value="">Choisir une méthode</option><option>Virement bancaire</option><option>Carte bancaire</option><option>Chèque</option><option>Espèces</option><option>Autre</option></select></Field>
      <Field label="Référence du paiement"><input value={referencePaiement} onChange={(e) => setReferencePaiement(e.target.value)} disabled={paid} placeholder="Ex. VIR-2026-001" className="field" /></Field>
      <Field label="Notes"><textarea value={notesPaiement} onChange={(e) => setNotesPaiement(e.target.value)} disabled={paid} placeholder="Informations complémentaires" className="field min-h-28 resize-y" /></Field>
      {message && <p className={`rounded-xl border p-3 text-sm ${message === "Paiement enregistré." ? "border-green-500/20 bg-green-500/[0.05] text-green-300" : "border-red-500/20 bg-red-500/[0.05] text-red-300"}`}>{message}</p>}
      {!paid && <button type="submit" disabled={saving} className="w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-50">{saving ? "Enregistrement…" : `Confirmer ${euros(royalty.montantDu)} payé`}</button>}
    </form>
    <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}.field:disabled{color:rgb(113 113 122);opacity:.7}`}</style>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}</span>{children}</label>; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
