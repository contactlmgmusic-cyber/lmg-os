import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import CalendarFilterView from "@/components/CalendarFilterView";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function formatDay(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function toDateKey(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

export default async function CalendrierArtistePage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = Array.from({ length: lastDay.getDate() }, (_, i) => {
    const date = new Date(year, month, i + 1);

    return {
      date,
      key: date.toISOString().split("T")[0],
    };
  });

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, artiste_id")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== ROLES.ARTISTE) {
    redirect("/");
  }

  if (!currentProfile?.artiste_id) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p>Aucun artiste lié à ce compte.</p>
      </main>
    );
  }

  const artisteId = currentProfile.artiste_id;

  const { data: projets } = await supabase
    .from("projets")
    .select(`
      id,
      titre,
      date_sortie,
      statut,
      artiste_id
    `)
    .eq("artiste_id", artisteId)
    .not("date_sortie", "is", null);

  const projetIds = projets?.map((projet: any) => projet.id) || [];

  const { data: rolloutEvents } =
    projetIds.length > 0
      ? await supabase
          .from("rollout_events")
          .select(`
            id,
            titre,
            date_event,
            type,
            statut,
            projet_id
          `)
          .in("projet_id", projetIds)
          .not("date_event", "is", null)
      : { data: [] };

  const { data: taches } =
    projetIds.length > 0
      ? await supabase
          .from("taches")
          .select(`
            id,
            titre,
            deadline,
            statut,
            priorite,
            projet_id
          `)
          .in("projet_id", projetIds)
          .not("deadline", "is", null)
      : { data: [] };

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, evenement, ville, date_event, statut, prochaine_relance")
    .eq("artiste_id", artisteId)
    .not("date_event", "is", null);

  const { data: contrats } = await supabase
    .from("contrats")
    .select("id, titre, statut, date_signature")
    .eq("artiste_id", artisteId)
    .not("date_signature", "is", null);

  const { data: sorties } = await supabase
    .from("sorties")
    .select("id, titre, date_sortie, statut")
    .eq("artiste_id", artisteId)
    .not("date_sortie", "is", null);

  const events = [
    ...(projets || []).map((projet: any) => ({
      id: projet.id,
      title: projet.titre,
      date: toDateKey(projet.date_sortie),
      type: "Projet",
      category: "Sortie",
      href: `/projets/${projet.id}`,
      color: "border-violet-500/50 bg-violet-500/10 text-violet-200",
    })),

    ...(sorties || []).map((sortie: any) => ({
      id: `sortie-${sortie.id}`,
      title: sortie.titre,
      date: toDateKey(sortie.date_sortie),
      type: `Sortie ${sortie.statut || ""}`,
      category: "Sortie",
      href: `/sorties/${sortie.id}`,
      color: "border-purple-500/50 bg-purple-500/10 text-purple-200",
    })),

    ...(rolloutEvents || []).map((event: any) => ({
      id: event.id,
      title: event.titre,
      date: toDateKey(event.date_event),
      type: event.type || "Rollout",
      category: "Rollout",
      href: "/mon-espace-artiste",
      color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-200",
    })),

    ...(taches || []).map((tache: any) => ({
      id: tache.id,
      title: tache.titre,
      date: toDateKey(tache.deadline),
      type: "Tâche",
      category: "Tâche",
      href: `/taches/${tache.id}`,
      color:
        tache.priorite === "Haute"
          ? "border-red-500/50 bg-red-500/10 text-red-200"
          : tache.priorite === "Moyenne"
          ? "border-orange-500/50 bg-orange-500/10 text-orange-200"
          : "border-zinc-700 bg-zinc-800 text-zinc-300",
    })),

    ...(contrats || []).map((contrat: any) => ({
      id: contrat.id,
      title: contrat.titre,
      date: toDateKey(contrat.date_signature),
      type: `Contrat ${contrat.statut || ""}`,
      category: "Contrat",
      href: `/contrats/${contrat.id}`,
      color: "border-green-500/50 bg-green-500/10 text-green-200",
    })),

    ...(bookings || []).map((booking: any) => ({
      id: booking.id,
      title: booking.evenement,
      date: toDateKey(booking.date_event),
      type: `Booking ${booking.statut || ""}`,
      category: "Booking",
      href: `/booking/${booking.id}`,
      color: "border-pink-500/50 bg-pink-500/10 text-pink-200",
    })),

    ...(bookings || [])
      .filter((booking: any) => booking.prochaine_relance)
      .map((booking: any) => ({
        id: `${booking.id}-relance`,
        title: `Relance : ${booking.evenement}`,
        date: toDateKey(booking.prochaine_relance),
        type: "Relance booking",
        category: "Relance",
        href: `/booking/${booking.id}`,
        color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
      })),
  ];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Mon espace artiste
          </p>

          <h1 className="text-5xl font-bold capitalize">
            {formatMonth(today)}
          </h1>

          <p className="mt-3 text-zinc-400">
            Ton calendrier personnel : sorties, tâches, rollouts, contrats et bookings.
          </p>
        </div>
      </div>

      <CalendarFilterView
        days={[
          ...Array.from({ length: (firstDay.getDay() + 6) % 7 }).map(
            (_, index) => ({
              key: `empty-${index}`,
              day: "",
              isToday: false,
            })
          ),
          ...days.map((day) => ({
            key: day.key,
            day: formatDay(day.date),
            isToday: day.key === toDateKey(new Date().toISOString()),
          })),
        ]}
        events={events}
      />
    </main>
  );
}