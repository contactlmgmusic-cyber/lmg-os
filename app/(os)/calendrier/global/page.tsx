import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import GoogleCalendarConnection from "@/components/GoogleCalendarConnection";
import CalendarCommandCenter, { type CalendarCommandItem } from "@/components/CalendarCommandCenter";

export const dynamic = "force-dynamic";

export default async function GlobalCalendarPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const profile = await requireRole([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ARTISTIC_DIRECTOR,
]);
  const isAdmin = profile.role === ROLES.SUPER_ADMIN || profile.role === ROLES.ADMIN;
  const [rolloutResult, bookingResult, mediaResult, influencerResult, taskResult, partnerResult, releaseTaskResult] = await Promise.all([
    supabase.from("rollout_events").select("id, titre, date_event, statut, type, projets(titre, artistes(nom))").not("date_event", "is", null),
    supabase.from("bookings").select("id, evenement, date_event, statut, ville, artistes(nom)").not("date_event", "is", null),
    supabase.from("medias").select("id, nom, prochaine_relance, statut, artistes(nom)").not("prochaine_relance", "is", null),
    supabase.from("influenceurs").select("id, nom, prochaine_relance, statut, artistes(nom)").not("prochaine_relance", "is", null),
    supabase.from("taches").select("id, titre, deadline, statut, priorite, responsable:profiles!taches_responsable_id_fkey(nom)").not("deadline", "is", null),
    isAdmin ? supabase.from("partenaires").select("id, nom, prochaine_relance, statut").not("prochaine_relance", "is", null) : Promise.resolve({ data: [] }),
    supabase.from("release_tasks").select("id, titre, date_prevue, statut, sortie_id, sorties(titre, artistes(nom))").not("date_prevue", "is", null),
  ]);
  const rolloutEvents = rolloutResult.data || [];
  const bookings = bookingResult.data || [];
  const medias = mediaResult.data || [];
  const influenceurs = influencerResult.data || [];
  const taches = taskResult.data || [];
  const partenaires = partnerResult.data || [];
  const releaseTasks = releaseTaskResult.data || [];

  const items: CalendarCommandItem[] = [
    ...(rolloutEvents || []).map((item: any) => ({
      id: item.id,
      type: "Rollout",
      titre: item.titre,
      date: item.date_event,
      statut: item.statut,
      link: `/rollout`,
      description: [item.projets?.artistes?.nom, item.projets?.titre, item.type].filter(Boolean).join(" · "),
    })),
    ...(bookings || []).map((item: any) => ({
      id: item.id,
      type: "Booking",
      titre: item.evenement,
      date: item.date_event,
      statut: item.statut,
      link: `/booking/${item.id}`,
      description: [item.artistes?.nom, item.ville].filter(Boolean).join(" · "),
    })),
    ...(medias || []).map((item: any) => ({
      id: item.id,
      type: "Relance média",
      titre: item.nom,
      date: item.prochaine_relance,
      statut: item.statut,
      link: `/medias/${item.id}`,
      description: [item.artistes?.nom, "Relance CRM médias"].filter(Boolean).join(" · "),
    })),
    ...(influenceurs || []).map((item: any) => ({
      id: item.id,
      type: "Relance influenceur",
      titre: item.nom,
      date: item.prochaine_relance,
      statut: item.statut,
      link: `/influenceurs/${item.id}`,
      description: [item.artistes?.nom, "Relance CRM influenceurs"].filter(Boolean).join(" · "),
    })),
    ...(taches || []).map((item: any) => ({
      id: item.id,
      type: "Tâche",
      titre: item.titre,
      date: item.deadline,
      statut: item.statut,
      link: `/taches/${item.id}`,
      description: [item.responsable?.nom, item.priorite, "Deadline tâche"].filter(Boolean).join(" · "),
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
  description: [item.sorties?.artistes?.nom, item.sorties?.titre, "Action release"].filter(Boolean).join(" · "),
})),
  ].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400">Opérations · Centre de commandement</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Calendrier global</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Toutes les échéances autorisées, reliées à leur artiste, leur projet et leur responsable.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">+ Nouvelle tâche</Link></div>
      </header>
      <div className="mb-8"><GoogleCalendarConnection /></div>
      <CalendarCommandCenter items={items} />
    </main>
  );
}
