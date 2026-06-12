import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type CalendarItem = {
  id: string;
  type: string;
  titre: string;
  date: string;
  statut?: string | null;
  link: string;
  description?: string | null;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function GlobalCalendarPage() {
  const { data: rolloutEvents } = await supabase
    .from("rollout_events")
    .select("id, titre, date_event, statut, type")
    .not("date_event", "is", null);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, evenement, date_event, statut, ville")
    .not("date_event", "is", null);

  const { data: medias } = await supabase
    .from("medias")
    .select("id, nom, prochaine_relance, statut")
    .not("prochaine_relance", "is", null);

  const { data: influenceurs } = await supabase
    .from("influenceurs")
    .select("id, nom, prochaine_relance, statut")
    .not("prochaine_relance", "is", null);

  const { data: taches } = await supabase
    .from("taches")
    .select("id, titre, deadline, statut")
    .not("deadline", "is", null);

    const { data: partenaires } = await supabase
  .from("partenaires")
  .select("id, nom, prochaine_relance, statut")
  .not("prochaine_relance", "is", null);

  const items: CalendarItem[] = [
    ...(rolloutEvents || []).map((item: any) => ({
      id: item.id,
      type: "Rollout",
      titre: item.titre,
      date: item.date_event,
      statut: item.statut,
      link: `/rollout`,
      description: item.type,
    })),
    ...(bookings || []).map((item: any) => ({
      id: item.id,
      type: "Booking",
      titre: item.evenement,
      date: item.date_event,
      statut: item.statut,
      link: `/booking/${item.id}`,
      description: item.ville,
    })),
    ...(medias || []).map((item: any) => ({
      id: item.id,
      type: "Relance média",
      titre: item.nom,
      date: item.prochaine_relance,
      statut: item.statut,
      link: `/medias/${item.id}`,
      description: "Relance CRM médias",
    })),
    ...(influenceurs || []).map((item: any) => ({
      id: item.id,
      type: "Relance influenceur",
      titre: item.nom,
      date: item.prochaine_relance,
      statut: item.statut,
      link: `/influenceurs/${item.id}`,
      description: "Relance CRM influenceurs",
    })),
    ...(taches || []).map((item: any) => ({
      id: item.id,
      type: "Tâche",
      titre: item.titre,
      date: item.deadline,
      statut: item.statut,
      link: `/taches/${item.id}`,
      description: "Deadline tâche",
    })),
    ...(partenaires || []).map((item: any) => ({
  id: item.id,
  type: "Relance partenaire",
  titre: item.nom,
  date: item.prochaine_relance,
  statut: item.statut,
  link: `/partenaires/${item.id}`,
  description: "Relance CRM partenaires",
})),
  ].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = items.filter((item) => new Date(item.date) >= today);
  const late = items.filter((item) => new Date(item.date) < today);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Calendar
        </p>

        <h1 className="text-5xl font-bold">Calendrier global</h1>

        <p className="mt-3 text-zinc-400">
          Rollout, bookings, relances médias, influenceurs et deadlines tâches.
        </p>
      </div>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard label="Événements à venir" value={upcoming.length} />
        <KpiCard label="En retard" value={late.length} danger />
        <KpiCard label="Total calendrier" value={items.length} />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_0.6fr]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">À venir</h2>

          {upcoming.length === 0 && (
            <p className="text-zinc-500">Aucun événement à venir.</p>
          )}

          <div className="space-y-4">
            {upcoming.map((item) => (
              <CalendarCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <h2 className="mb-6 text-3xl font-bold text-red-300">
            En retard
          </h2>

          {late.length === 0 && (
            <p className="text-red-200/70">Aucun retard.</p>
          )}

          <div className="space-y-4">
            {late.map((item) => (
              <CalendarCard key={`${item.type}-${item.id}`} item={item} danger />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        danger
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-zinc-800 bg-zinc-900 text-white"
      }`}
    >
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function CalendarCard({
  item,
  danger,
}: {
  item: CalendarItem;
  danger?: boolean;
}) {
  return (
    <Link
      href={item.link}
      className={`block rounded-2xl border p-5 hover:border-zinc-500 ${
        danger
          ? "border-red-500/30 bg-black text-red-100"
          : "border-zinc-800 bg-black"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{item.type}</p>

          <h3 className="mt-1 text-xl font-semibold">
            {item.titre}
          </h3>

          {item.description && (
            <p className="mt-2 text-sm text-zinc-500">
              {item.description}
            </p>
          )}
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
          {item.statut || "À faire"}
        </span>
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        {formatDate(item.date)}
      </p>
    </Link>
  );
}