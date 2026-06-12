"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { notifyRoles } from "@/lib/notify";

export default function NouveauBookingPage() {
  const router = useRouter();

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
  const [prochaineRelance, setProchaineRelance] = useState("");

  useEffect(() => {
    async function fetchArtistes() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("*")
        .order("nom", { ascending: true });

      if (data) setArtistes(data);
    }

    fetchArtistes();
  }, []);

  async function ajouterBooking(e: React.FormEvent) {
    e.preventDefault();

    const finalStatut = statut || "Prospect";

    const { data, error } = await supabaseBrowser
      .from("bookings")
      .insert({
        evenement,
        organisateur: organisateur || null,
        ville: ville || null,
        date_event: dateEvent || null,
        cachet: cachet ? Number(cachet) : null,
        statut: finalStatut,
        contact: contact || null,
        notes: notes || null,
        artiste_id: artisteId || null,
        prochaine_relance: prochaineRelance || null,
      })
      .select("id")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    await supabaseBrowser.from("activity_logs").insert({
      type: "Booking",
      titre: "Nouveau booking créé",
      description: `${evenement} • ${ville || "Ville non renseignée"}`,
    });

    await notifyRoles({
      roles: ["super_admin", "manager"],
      type: "Booking",
      titre: "Nouveau booking créé",
      description: `${evenement} • ${ville || "Ville non renseignée"}`,
      link: `/booking/${data.id}`,
    });

    if (finalStatut === "Confirmé") {
      await supabaseBrowser.from("activity_logs").insert({
        type: "Booking",
        titre: "Booking confirmé",
        description: `${evenement} • ${dateEvent || "Date non renseignée"}`,
      });

      await notifyRoles({
        roles: ["super_admin", "manager"],
        type: "Booking",
        titre: "Booking confirmé",
        description: `${evenement} • ${dateEvent || "Date non renseignée"}`,
        link: `/booking/${data.id}`,
      });
    }

    router.push("/booking");
    router.refresh();
  }

  return (
    <main className="p-10 text-white">
      <h1 className="text-4xl font-bold mb-8">Nouveau booking</h1>

      <form onSubmit={ajouterBooking} className="max-w-xl space-y-5">
        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Nom de l’événement"
          value={evenement}
          onChange={(e) => setEvenement(e.target.value)}
          required
        />

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Organisateur / structure"
          value={organisateur}
          onChange={(e) => setOrganisateur(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />

        <input
          type="date"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={dateEvent}
          onChange={(e) => setDateEvent(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Cachet proposé / négocié"
          value={cachet}
          onChange={(e) => setCachet(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Statut</option>
          <option value="Prospect">Prospect</option>
          <option value="Contacté">Contacté</option>
          <option value="En négociation">En négociation</option>
          <option value="Confirmé">Confirmé</option>
          <option value="Payé">Payé</option>
          <option value="Annulé">Annulé</option>
        </select>

        <input
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Contact / email / téléphone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          value={artisteId}
          onChange={(e) => setArtisteId(e.target.value)}
        >
          <option value="">Sélectionner un artiste</option>

          {artistes.map((artiste) => (
            <option key={artiste.id} value={artiste.id}>
              {artiste.nom}
            </option>
          ))}
        </select>

        <textarea
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4"
          placeholder="Notes internes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <input
          type="date"
          value={prochaineRelance}
          onChange={(e) => setProchaineRelance(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-white"
        />

        <button
          type="submit"
          className="rounded-xl bg-white text-black px-6 py-4 font-semibold hover:bg-zinc-200 transition"
        >
          Créer le booking
        </button>
      </form>
    </main>
  );
}