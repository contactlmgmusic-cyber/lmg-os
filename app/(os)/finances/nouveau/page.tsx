"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NouvelleFinancePage() {
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("Dépense");
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("");
  const [statut, setStatut] = useState("Prévu");
  const [dateOperation, setDateOperation] = useState("");
  const [artisteId, setArtisteId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [notes, setNotes] = useState("");

  const [artistes, setArtistes] = useState<any[]>([]);
  const [projets, setProjets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: artistesData } = await supabaseBrowser
        .from("artistes")
        .select("id, nom")
        .order("nom");

      const { data: projetsData } = await supabaseBrowser
        .from("projets")
        .select("id, titre")
        .order("titre");

      const { data: bookingsData } = await supabaseBrowser
        .from("bookings")
        .select("id, evenement")
        .order("evenement");

      setArtistes(artistesData || []);
      setProjets(projetsData || []);
      setBookings(bookingsData || []);
    }

    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim() || !montant) {
      alert("Ajoute au minimum un titre et un montant.");
      return;
    }

    setLoading(true);

    const { error } = await supabaseBrowser.from("finances").insert({
      titre,
      type,
      categorie,
      montant: Number(montant),
      statut,
      date_operation: dateOperation || null,
      artiste_id: artisteId || null,
      projet_id: projetId || null,
      booking_id: bookingId || null,
      notes,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/finances");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <h1 className="text-5xl font-bold">Nouvelle opération</h1>
        <p className="mt-3 text-zinc-400">
          Ajouter une dépense ou un revenu lié à LMG.
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
          placeholder="Catégorie : Clip, Booking, Promo, Studio..."
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

        <select
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option value="">Aucun artiste lié</option>
          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option value="">Aucun projet lié</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <select
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        >
          <option value="">Aucun booking lié</option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.evenement}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="min-h-40 w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-4 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer l’opération"}
        </button>
      </form>
    </main>
  );
}