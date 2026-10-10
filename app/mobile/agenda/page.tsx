import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const staffRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR] as const;
type AgendaItem = { id: string; title: string; date: string; detail: string; href: string; kind: string };

export default async function MobileAgendaPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const profile = await requireRole(staffRoles);
  const globalView = (await searchParams).vue === "global";
  const supabase = await createAuthenticatedSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: events }, { data: bookings }, { data: tasks }, { data: internalEvents }, { data: managedArtists }] = await Promise.all([
    supabase.from("artiste_events").select("id, titre, date_event, type, lieu, artiste_id").gte("date_event", today).order("date_event", { ascending: true }).limit(50),
    supabase.from("bookings").select("id, evenement, date_event, ville, statut, artiste_id").gte("date_event", today).order("date_event", { ascending: true }).limit(50),
    supabase.from("taches").select("id, titre, deadline, priorite, statut, responsable_id, assigned_to, task_assignees(user_id)").gte("deadline", today).neq("statut", "Terminé").order("deadline", { ascending: true }).limit(100),
    supabase.from("internal_events").select("id, titre, type, date_debut, lieu, statut, participant_ids, created_by").gte("date_debut", today).order("date_debut", { ascending: true }).limit(100),
    profile.role === ROLES.MANAGER ? supabase.from("artistes").select("id").eq("manager_id", profile.id) : Promise.resolve({ data: [] }),
  ]);

  const managedArtistIds = new Set((managedArtists || []).map((artist: any) => artist.id));
  const isMyTask = (task: any) => task.responsable_id === profile.id || task.assigned_to === profile.id || task.task_assignees?.some((assignee: any) => assignee.user_id === profile.id);
  const isMyInternalEvent = (event: any) => event.created_by === profile.id || event.participant_ids?.includes(profile.id);
  const isMyArtistDate = (item: any) => profile.role === ROLES.MANAGER && managedArtistIds.has(item.artiste_id);

  const visibleEvents = globalView ? events || [] : (events || []).filter(isMyArtistDate);
  const visibleBookings = globalView ? bookings || [] : (bookings || []).filter(isMyArtistDate);
  const visibleTasks = globalView ? tasks || [] : (tasks || []).filter(isMyTask);
  const visibleInternalEvents = globalView ? internalEvents || [] : (internalEvents || []).filter(isMyInternalEvent);

  const items: AgendaItem[] = [
    ...visibleEvents.map((event: any) => ({ id: `event-${event.id}`, title: event.titre, date: event.date_event, detail: event.lieu || event.type || "Événement artiste", href: `/mobile/agenda/evenements/${event.id}`, kind: "Événement" })),
    ...visibleBookings.map((booking: any) => ({ id: `booking-${booking.id}`, title: booking.evenement || "Booking", date: booking.date_event, detail: booking.ville || booking.statut || "Booking", href: `/mobile/agenda/bookings/${booking.id}`, kind: "Booking" })),
    ...visibleTasks.map((task: any) => ({ id: `task-${task.id}`, title: task.titre, date: task.deadline, detail: task.priorite || "Tâche", href: `/mobile/taches/${task.id}`, kind: "Échéance" })),
    ...visibleInternalEvents.map((event: any) => ({ id: `internal-${event.id}`, title: event.titre, date: event.date_debut, detail: event.lieu || event.statut || "LMG", href: `/mobile/agenda/interne/${event.id}`, kind: event.type || "Événement LMG" })),
  ].filter((item) => item.date).sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(0, 50);

  return <div className="px-5 py-6"><PageTitle globalView={globalView} /><div className="mt-5 grid grid-cols-2 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-1"><Link href="/mobile/agenda" className={`rounded-[14px] px-3 py-3 text-center text-xs font-black ${!globalView ? "bg-[#f2b705] text-black" : "text-zinc-500"}`}>Mon agenda</Link><Link href="/mobile/agenda?vue=global" className={`rounded-[14px] px-3 py-3 text-center text-xs font-black ${globalView ? "bg-white text-black" : "text-zinc-500"}`}>Agenda global</Link></div><Link href="/mobile/agenda/nouveau" className="mt-4 block rounded-[18px] border border-[#f2b705]/30 bg-[#f2b705]/10 px-5 py-4 text-center text-sm font-black text-[#f2b705]">+ Nouvel événement LMG</Link><div className="mt-6 space-y-2">{items.length ? items.map((item) => <Link key={item.id} href={item.href} className="flex gap-4 rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4"><div className="w-11 shrink-0 text-center"><p className="text-xl font-black text-[#f2b705]">{day(item.date)}</p><p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">{month(item.date)}</p></div><div className="min-w-0 border-l border-white/[0.07] pl-4"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">{item.kind}</p><h2 className="mt-1 truncate text-sm font-black">{item.title}</h2><p className="mt-1 truncate text-xs text-zinc-600">{item.detail}</p></div></Link>) : <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-600">{globalView ? "Aucun événement global à venir." : "Rien de prévu dans ton agenda personnel."}</div>}</div>{!globalView && <p className="mt-5 text-center text-[10px] leading-5 text-zinc-700">La synchronisation avec le calendrier du téléphone utilisera uniquement cet agenda personnel.</p>}</div>;
}

function PageTitle({ globalView }: { globalView: boolean }) { return <header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">{globalView ? "Vue de l’équipe" : "Espace personnel"}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">{globalView ? "Agenda global" : "Mon agenda"}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{globalView ? "Toutes les dates importantes de l’écosystème LMG." : "Tes tâches, réunions et dates liées à ton périmètre uniquement."}</p></header>; }
function toDate(value: string) { return new Date(value.length === 10 ? `${value}T12:00:00` : value); }
function day(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(toDate(value)); }
function month(value: string) { return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(toDate(value)).replace(".", ""); }
