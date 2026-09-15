"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Artist = { id: string; nom: string };
type Project = { id: string; titre: string; artiste_id: string | null };
type Booking = { id: string; evenement: string; artiste_id: string | null };
type Finance = { id: string; titre: string | null; type: string | null; categorie: string | null; montant: number | string | null; statut: string | null; date_operation: string | null; artiste_id: string | null; projet_id: string | null; booking_id: string | null; notes: string | null };
const categories = { Revenu: ["Booking", "Streaming", "Royalties", "Synchronisation", "Partenariat", "Merchandising", "Autre revenu"], Dépense: ["Clip", "Cover", "Promotion", "Studio", "Influence", "Relations presse", "Distribution", "Déplacement", "Juridique", "Administration", "Autre dépense"] };

export default function FinanceEditForm({ finance, artists, projects, bookings }: { finance: Finance; artists: Artist[]; projects: Project[]; bookings: Booking[] }) {
  const router = useRouter();
  const initialType = finance.type === "Revenu" ? "Revenu" : "Dépense";
  const [titre, setTitre] = useState(finance.titre || "");
  const [type, setType] = useState<"Revenu" | "Dépense">(initialType);
  const [categorie, setCategorie] = useState(finance.categorie || "");
  const [montant, setMontant] = useState(String(finance.montant || ""));
  const [statut, setStatut] = useState(finance.statut || "Prévu");
  const [dateOperation, setDateOperation] = useState(finance.date_operation || "");
  const [artisteId, setArtisteId] = useState(finance.artiste_id || "");
  const [projetId, setProjetId] = useState(finance.projet_id || "");
  const [bookingId, setBookingId] = useState(finance.booking_id || "");
  const [notes, setNotes] = useState(finance.notes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const amount = Number(montant || 0);
  const availableProjects = useMemo(() => artisteId ? projects.filter((item) => item.artiste_id === artisteId) : projects, [projects, artisteId]);
  const availableBookings = useMemo(() => artisteId ? bookings.filter((item) => !item.artiste_id || item.artiste_id === artisteId) : bookings, [bookings, artisteId]);
  const project = projects.find((item) => item.id === projetId);
  const booking = bookings.find((item) => item.id === bookingId);
  const coherent = (!project?.artiste_id || project.artiste_id === artisteId) && (!booking?.artiste_id || booking.artiste_id === artisteId);
  const valid = titre.trim().length > 1 && Boolean(categorie && amount > 0 && dateOperation && coherent);

  function chooseType(next: "Revenu" | "Dépense") { setType(next); if (!categories[next].includes(categorie)) setCategorie(""); setMessage(""); }
  function chooseArtist(id: string) { setArtisteId(id); setMessage(""); if (project?.artiste_id && project.artiste_id !== id) setProjetId(""); if (booking?.artiste_id && booking.artiste_id !== id) setBookingId(""); }
  function chooseProject(id: string) { const selected = projects.find((item) => item.id === id); setProjetId(id); if (selected?.artiste_id) setArtisteId(selected.artiste_id); setMessage(""); }
  function chooseBooking(id: string) { const selected = bookings.find((item) => item.id === id); setBookingId(id); if (selected?.artiste_id) setArtisteId(selected.artiste_id); setMessage(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!valid || saving) return; setSaving(true); setMessage("");
    if (projetId) { const { data } = await supabaseBrowser.from("projets").select("artiste_id").eq("id", projetId).single(); if (data?.artiste_id && data.artiste_id !== artisteId) { setMessage("Le projet n’est plus rattaché à l’artiste sélectionné."); setSaving(false); return; } }
    const { error } = await supabaseBrowser.from("finances").update({ titre: titre.trim(), type, categorie, montant: amount, statut, date_operation: dateOperation, artiste_id: artisteId || null, projet_id: projetId || null, booking_id: bookingId || null, notes: notes.trim() || null }).eq("id", finance.id);
    if (error) { setMessage(error.message); setSaving(false); return; }
    router.push(`/finances/${finance.id}`); router.refresh();
  }

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px]">
    <Link href={`/finances/${finance.id}`} className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour à l’opération</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Modifier l’opération</h1><p className="mt-3 max-w-3xl text-zinc-500">Mets à jour le flux et vérifie son impact avant de l’enregistrer.</p></header>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <form onSubmit={submit} className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
        <div className="grid grid-cols-2 gap-3"><TypeButton label="Dépense" active={type === "Dépense"} tone="red" onClick={() => chooseType("Dépense")} /><TypeButton label="Revenu" active={type === "Revenu"} tone="green" onClick={() => chooseType("Revenu")} /></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Titre"><input value={titre} onChange={(e) => setTitre(e.target.value)} className="field" /></Field><Field label="Catégorie"><select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="field"><option value="">Choisir une catégorie</option>{categories[type].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Montant"><div className="relative"><input type="number" min="0.01" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} className="field pr-12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">€</span></div></Field><Field label="Statut"><select value={statut} onChange={(e) => setStatut(e.target.value)} className="field"><option>Prévu</option><option>Facturé</option><option>Payé</option><option>Annulé</option></select></Field><Field label="Date"><input type="date" value={dateOperation} onChange={(e) => setDateOperation(e.target.value)} className="field" /></Field><Field label="Artiste" optional><select value={artisteId} onChange={(e) => chooseArtist(e.target.value)} className="field"><option value="">Aucun artiste</option>{artists.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</select></Field><Field label="Projet" optional><select value={projetId} onChange={(e) => chooseProject(e.target.value)} className="field"><option value="">Aucun projet</option>{availableProjects.map((item) => <option key={item.id} value={item.id}>{item.titre}</option>)}</select></Field><Field label="Booking" optional><select value={bookingId} onChange={(e) => chooseBooking(e.target.value)} className="field"><option value="">Aucun booking</option>{availableBookings.map((item) => <option key={item.id} value={item.id}>{item.evenement}</option>)}</select></Field></div>
        <div className="mt-4"><Field label="Notes internes" optional><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field min-h-28 resize-y" /></Field></div>
        {message && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}
        <button disabled={!valid || saving} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Enregistrement…" : valid ? "Enregistrer les modifications" : "Complète les informations obligatoires"}</button>
        <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style>
      </form>
      <aside className="space-y-4"><section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Impact après modification</p><p className={`mt-4 text-4xl font-bold ${type === "Revenu" ? "text-green-400" : "text-red-400"}`}>{type === "Revenu" ? "+" : "−"} {euros(amount)}</p><p className="mt-2 text-sm text-zinc-500">{statut === "Payé" ? "Impacte la trésorerie réelle" : statut === "Annulé" ? "Exclu des calculs financiers" : "Reste dans les engagements prévisionnels"}</p><div className="mt-5 space-y-3"><Info label="Statut" value={statut} /><Info label="Projet" value={project?.titre || "Non lié"} /><Info label="Booking" value={booking?.evenement || "Non lié"} /></div></section><section className="rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.04] p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Attention</p><p className="mt-3 text-sm leading-6 text-zinc-500">Changer le type, le montant ou le statut modifie immédiatement la trésorerie, la rentabilité et les alertes du cockpit Finance.</p></section></aside>
    </section>
  </div></main>;
}

function TypeButton({ label, active, tone, onClick }: { label: string; active: boolean; tone: "red" | "green"; onClick: () => void }) { const style = tone === "green" ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"; return <button type="button" onClick={onClick} className={`rounded-xl border px-5 py-4 text-sm font-bold ${active ? style : "border-zinc-800 bg-black text-zinc-500"}`}>{label}</button>; }
function Field({ label, children, optional = false }: { label: string; children: React.ReactNode; optional?: boolean }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}{optional ? <span className="font-normal text-zinc-700"> · optionnel</span> : <span className="text-yellow-500"> *</span>}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function euros(value: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value || 0); }
