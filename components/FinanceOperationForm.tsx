"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Artist = { id: string; nom: string };
type Project = { id: string; titre: string; artiste_id: string | null };
type Booking = { id: string; evenement: string; artiste_id: string | null };
const categories = {
  Revenu: ["Booking", "Streaming", "Royalties", "Synchronisation", "Partenariat", "Merchandising", "Autre revenu"],
  Dépense: ["Clip", "Cover", "Promotion", "Studio", "Influence", "Relations presse", "Distribution", "Déplacement", "Juridique", "Administration", "Autre dépense"],
};

export default function FinanceOperationForm({ artists, projects, bookings, loadError }: { artists: Artist[]; projects: Project[]; bookings: Booking[]; loadError: string }) {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [type, setType] = useState<"Revenu" | "Dépense">("Dépense");
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [statut, setStatut] = useState("Prévu");
  const [dateOperation, setDateOperation] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const amount = Number(montant || 0);
  const selectedArtist = artists.find((item) => item.id === artisteId);
  const selectedProject = projects.find((item) => item.id === projetId);
  const selectedBooking = bookings.find((item) => item.id === bookingId);
  const availableProjects = useMemo(() => artisteId ? projects.filter((item) => item.artiste_id === artisteId) : projects, [projects, artisteId]);
  const availableBookings = useMemo(() => artisteId ? bookings.filter((item) => !item.artiste_id || item.artiste_id === artisteId) : bookings, [bookings, artisteId]);
  const coherent = (!selectedProject || !selectedProject.artiste_id || selectedProject.artiste_id === artisteId) && (!selectedBooking || !selectedBooking.artiste_id || selectedBooking.artiste_id === artisteId);
  const valid = titre.trim().length > 1 && Boolean(categorie && amount > 0 && dateOperation && coherent);

  function chooseType(next: "Revenu" | "Dépense") { setType(next); setCategorie(""); setMessage(""); }
  function chooseArtist(id: string) {
    setArtisteId(id); setMessage("");
    if (selectedProject?.artiste_id && selectedProject.artiste_id !== id) setProjetId("");
    if (selectedBooking?.artiste_id && selectedBooking.artiste_id !== id) setBookingId("");
  }
  function chooseProject(id: string) {
    const project = projects.find((item) => item.id === id); setProjetId(id); setMessage("");
    if (project?.artiste_id) setArtisteId(project.artiste_id);
  }
  function chooseBooking(id: string) {
    const booking = bookings.find((item) => item.id === id); setBookingId(id); setMessage("");
    if (booking?.artiste_id) setArtisteId(booking.artiste_id);
    if (booking && !titre.trim()) setTitre(booking.evenement);
    if (booking && type === "Revenu") setCategorie("Booking");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true); setMessage("");
    if (projetId) {
      const { data: project } = await supabaseBrowser.from("projets").select("artiste_id").eq("id", projetId).single();
      if (project?.artiste_id && project.artiste_id !== artisteId) { setMessage("Le projet n’est plus rattaché à l’artiste sélectionné."); setSaving(false); return; }
    }
    const { data, error } = await supabaseBrowser.from("finances").insert({
      titre: titre.trim(), type, categorie, montant: amount, statut, date_operation: dateOperation,
      artiste_id: artisteId || null, projet_id: projetId || null, booking_id: bookingId || null, notes: notes.trim() || null,
    }).select("id").single();
    if (error) { setMessage(error.message); setSaving(false); return; }
    router.push(`/finances/${data.id}`); router.refresh();
  }

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1300px]">
    <Link href="/finances" className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour aux transactions</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Finance LMG</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Nouvelle opération</h1><p className="mt-3 max-w-3xl text-zinc-500">Enregistre un flux fiable qui alimentera automatiquement la trésorerie et la rentabilité.</p></header>
    {loadError ? <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5 text-red-300">Impossible de charger les rattachements financiers.</div> :
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <form onSubmit={submit} className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
        <div className="grid grid-cols-2 gap-3"><TypeButton label="Dépense" active={type === "Dépense"} tone="red" onClick={() => chooseType("Dépense")} /><TypeButton label="Revenu" active={type === "Revenu"} tone="green" onClick={() => chooseType("Revenu")} /></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Titre"><input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Objet de l’opération" className="field" /></Field><Field label="Catégorie"><select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="field"><option value="">Choisir une catégorie</option>{categories[type].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Montant"><div className="relative"><input type="number" min="0.01" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0,00" className="field pr-12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">€</span></div></Field><Field label="Statut"><select value={statut} onChange={(e) => setStatut(e.target.value)} className="field"><option>Prévu</option><option>Facturé</option><option>Payé</option><option>Annulé</option></select></Field><Field label="Date de l’opération"><input type="date" value={dateOperation} onChange={(e) => setDateOperation(e.target.value)} className="field" /></Field><Field label="Artiste" optional><select value={artisteId} onChange={(e) => chooseArtist(e.target.value)} className="field"><option value="">Aucun artiste</option>{artists.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</select></Field><Field label="Projet" optional><select value={projetId} onChange={(e) => chooseProject(e.target.value)} className="field"><option value="">Aucun projet</option>{availableProjects.map((item) => <option key={item.id} value={item.id}>{item.titre}</option>)}</select></Field><Field label="Booking" optional><select value={bookingId} onChange={(e) => chooseBooking(e.target.value)} className="field"><option value="">Aucun booking</option>{availableBookings.map((item) => <option key={item.id} value={item.id}>{item.evenement}</option>)}</select></Field></div>
        <div className="mt-4"><Field label="Notes internes" optional><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Justificatif attendu, échéance, contexte…" className="field min-h-28 resize-y" /></Field></div>
        {message && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-sm text-red-300">{message}</p>}
        <button type="submit" disabled={!valid || saving} className="mt-6 w-full rounded-xl bg-white px-5 py-4 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Enregistrement…" : valid ? "Créer l’opération" : "Complète les informations obligatoires"}</button>
        <style jsx>{`.field{width:100%;min-height:3rem;border:1px solid rgb(39 39 42);border-radius:.75rem;background:#000;padding:.75rem 1rem;color:#fff;outline:none}.field:focus{border-color:rgb(82 82 91)}`}</style>
      </form>
      <aside className="space-y-4"><section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Aperçu</p><div className="mt-4 flex items-start justify-between gap-4"><div><p className="font-semibold">{titre.trim() || "Opération sans titre"}</p><p className="mt-1 text-xs text-zinc-600">{categorie || "Catégorie à choisir"} · {statut}</p></div><p className={`text-xl font-bold ${type === "Revenu" ? "text-green-400" : "text-red-400"}`}>{type === "Revenu" ? "+" : "−"} {euros(amount)}</p></div><div className="mt-5 space-y-3"><Info label="Date" value={dateOperation ? formatDate(dateOperation) : "À renseigner"} /><Info label="Artiste" value={selectedArtist?.nom || "Non lié"} /><Info label="Projet" value={selectedProject?.titre || "Non lié"} /><Info label="Booking" value={selectedBooking?.evenement || "Non lié"} /></div></section><section className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Règle de gestion</p><p className="mt-3 text-sm leading-6 text-zinc-500">Au moins un rattachement est recommandé pour attribuer correctement la rentabilité. Le statut doit ensuite évoluer de <strong className="text-zinc-300">Prévu</strong> à <strong className="text-zinc-300">Facturé</strong>, puis <strong className="text-zinc-300">Payé</strong>.</p></section></aside>
    </section>}
  </div></main>;
}

function TypeButton({ label, active, tone, onClick }: { label: string; active: boolean; tone: "red" | "green"; onClick: () => void }) { const activeStyle = tone === "green" ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"; return <button type="button" onClick={onClick} className={`rounded-xl border px-5 py-4 text-sm font-bold ${active ? activeStyle : "border-zinc-800 bg-black text-zinc-500"}`}>{label}</button>; }
function Field({ label, children, optional = false }: { label: string; children: React.ReactNode; optional?: boolean }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-500">{label}{optional ? <span className="font-normal text-zinc-700"> · optionnel</span> : <span className="text-yellow-500"> *</span>}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-zinc-800 bg-black p-4"><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function euros(amount: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount || 0); }
function formatDate(input: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${input}T12:00:00`)); }
