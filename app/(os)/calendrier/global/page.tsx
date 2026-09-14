import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import GoogleCalendarConnection from "@/components/GoogleCalendarConnection";
import CalendarCommandCenter, { type CalendarCommandItem } from "@/components/CalendarCommandCenter";

export const dynamic = "force-dynamic";

export default async function GlobalCalendarPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
]);

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

  const { data: releaseTasks } = await supabase
  .from("release_tasks")
  .select("id, titre, date_prevue, statut, sortie_id")
  .not("date_prevue", "is", null);

  const items: CalendarCommandItem[] = [
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

...(releaseTasks || []).map((item: any) => ({
  id: item.id,
  type: "Release Planner",
  titre: item.titre,
  date: item.date_prevue,
  statut: item.statut,
  link: `/release-planner/${item.sortie_id}`,
  description: "Action release",
})),
  ].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">Pilotage · LMG Music</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Calendrier global</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Toutes les échéances opérationnelles de LMG, réunies et priorisées au même endroit.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">+ Nouvelle tâche</Link></div>
      </header>
      <div className="mb-8"><GoogleCalendarConnection /></div>
      <CalendarCommandCenter items={items} />
    </main>
  );
}
