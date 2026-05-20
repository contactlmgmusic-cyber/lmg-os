import { supabase } from "@/lib/supabase";
import CalendarView from "@/components/CalendarView";

export default async function CalendrierPage() {
  const { data: projets } = await supabase
    .from("projets")
    .select("*");

  const { data: taches } = await supabase
    .from("taches")
    .select("*");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*");

  const projetEvents =
    projets?.filter((p) => p.date_sortie).map((projet) => ({
      title: `🎵 ${projet.titre}`,
      start: new Date(projet.date_sortie),
      end: new Date(projet.date_sortie),
    })) || [];

  const tacheEvents =
    taches?.filter((t) => t.deadline).map((tache) => ({
      title: `📌 ${tache.titre}`,
      start: new Date(tache.deadline),
      end: new Date(tache.deadline),
    })) || [];

  const bookingEvents =
    bookings?.filter((b) => b.date_event).map((booking) => ({
      title: `🎤 ${booking.evenement}`,
      start: new Date(booking.date_event),
      end: new Date(booking.date_event),
    })) || [];

  const events = [
    ...projetEvents,
    ...tacheEvents,
    ...bookingEvents,
  ];

  return (
    <main className="p-10 text-white">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-2">
          Calendrier LMG
        </h1>

        <p className="text-zinc-400">
          Sorties, deadlines, bookings et événements
        </p>
      </div>

      <CalendarView events={events} />
    </main>
  );
}