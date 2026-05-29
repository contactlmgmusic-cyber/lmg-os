"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ModifierBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [evenement, setEvenement] = useState("");
  const [organisateur, setOrganisateur] = useState("");
  const [ville, setVille] = useState("");
  const [dateEvent, setDateEvent] = useState("");
  const [cachet, setCachet] = useState("");
  const [statut, setStatut] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [artisteId, setArtisteId] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: booking } = await supabaseBrowser
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (booking) {
        setEvenement(booking.evenement || "");
        setOrganisateur(booking.organisateur || "");
        setVille(booking.ville || "");
        setDateEvent(booking.date_event || "");
        setCachet(booking.cachet || "");
        setStatut(booking.statut || "Prospect");
        setContact(booking.contact || "");
        setNotes(booking.notes || "");
        setArtisteId(booking.artiste_id || "");
      }

      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      setArtistes(artistesData || []);
      setLoading(false);
    }

    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabaseBrowser
      .from("bookings")
      .update({
        evenement,
        organisateur,
        ville,
        date_event: dateEvent || null,
        cachet: cachet ? Number(cachet) : null,
        statut,
        contact,
        notes,
        artiste_id: artisteId || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/booking/${id}`);
    router.refresh();
  }

  if (loading) {
    return <main className="p-10 text-white">Chargement...</main>;
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Modifier booking</h1>
        <p className="mt-3 text-zinc-400">
          Mettre à jour les infos de l’opportunité booking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <input value={evenement} onChange={(e) => setEvenement(e.target.value)} placeholder="Événement" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <input value={organisateur} onChange={(e) => setOrganisateur(e.target.value)} placeholder="Organisateur" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <input type="date" value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <input type="number" value={cachet} onChange={(e) => setCachet(e.target.value)} placeholder="Cachet estimé (€)" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white">
          <option>Prospect</option>
          <option>Contacté</option>
          <option>Relancé</option>
          <option>En négociation</option>
          <option>Confirmé</option>
          <option>Payé</option>
          <option>Refusé</option>
        </select>

        <select value={artisteId} onChange={(e) => setArtisteId(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white">
          <option value="">Aucun artiste lié</option>
          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <textarea value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact" className="min-h-28 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white" />

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}