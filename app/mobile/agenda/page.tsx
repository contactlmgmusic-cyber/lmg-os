import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileAgendaPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  const [{ data: events }, { data: bookings }, { data: tasks }, { data: internalEvents }] = await Promise.all([
    supabase.from("artiste_events").select("id, titre, date_event, type, lieu, artiste_id").gte("date_event", today).order("date_event", { ascending: true }).limit(20),
    supabase.from("bookings").select("id, evenement, date_event, ville, statut").gte("date_event", today).order("date_event", { ascending: true }).limit(20),
    supabase.from("taches").select("id, titre, deadline, priorite, statut").gte("deadline", today).neq("statut", "Terminé").order("deadline", { ascending: true }).limit(20),
    supabase.from("internal_events").select("id, titre, type, date_debut, lieu, statut").gte("date_debut", today).order("date_debut", { ascending: true }).limit(20),
  ]);

  const items = [
    ...(events || []).map((event: any) => ({ id: `event-${event.id}`, title: event.titre, date: event.date_event, detail: event.lieu || event.type || "Événement artiste", href: `/mobile/agenda/evenements/${event.id}`, kind: "Événement" })),
    ...(bookings || []).map((booking: any) => ({ id: `booking-${booking.id}`, title: booking.evenement || "Booking", date: booking.date_event, detail: booking.ville || booking.statut || "Booking", href: `/mobile/agenda/bookings/${booking.id}`, kind: "Booking" })),
    ...(tasks || []).map((task: any) => ({ id: `task-${task.id}`, title: task.titre, date: task.deadline, detail: task.priorite || "Tâche", href: `/mobile/taches/${task.id}`, kind: "Échéance" })),
    ...(internalEvents || []).map((event: any) => ({ id: `internal-${event.id}`, title: event.titre, date: event.date_debut, detail: event.lieu || event.statut || "LMG", href: `/mobile/agenda/interne/${event.id}`, kind: event.type || "Événement LMG" })),
  ].filter((item) => item.date).sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 30);

  return <div className="px-5 py-6"><PageTitle /><Link href="/mobile/agenda/nouveau" className="mt-5 block rounded-[18px] bg-[#f2b705] px-5 py-4 text-center text-sm font-black text-black">+ Nouvel événement LMG</Link><div className="mt-6 space-y-2">{items.length ? items.map((item) => <Link key={item.id} href={item.href} className="flex gap-4 rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4"><div className="w-11 shrink-0 text-center"><p className="text-xl font-black text-[#f2b705]">{day(item.date)}</p><p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">{month(item.date)}</p></div><div className="min-w-0 border-l border-white/[0.07] pl-4"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">{item.kind}</p><h2 className="mt-1 truncate text-sm font-black">{item.title}</h2><p className="mt-1 truncate text-xs text-zinc-600">{item.detail}</p></div></Link>) : <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-600">Aucun événement à venir.</div>}</div></div>;
}

function PageTitle() { return <header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Calendrier global</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Agenda</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Réunions LMG, sorties, tâches, bookings et événements artistes réunis.</p></header>; }
function toDate(value: string) { return new Date(value.length === 10 ? `${value}T12:00:00` : value); }
function day(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(toDate(value)); }
function month(value: string) { return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(toDate(value)).replace(".", ""); }
