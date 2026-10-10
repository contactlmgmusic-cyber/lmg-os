import Link from "next/link";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { loadCalendar } from "@/lib/calendar.server";
import GoogleCalendarConnection from "@/components/GoogleCalendarConnection";
import CalendarCommandCenter from "@/components/CalendarCommandCenter";
import CalendarDataWarning from "@/components/CalendarDataWarning";
export const dynamic = "force-dynamic";
export default async function GlobalCalendarPage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR]);
  const { items, errors } = await loadCalendar(profile);
  return <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
    <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-400">Opérations · Centre de commandement</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Calendrier global</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Toutes les échéances autorisées, issues des mêmes sources que le calendrier mensuel.</p></div><div className="flex flex-wrap gap-3"><Link href="/evenements/nouveau" className="rounded-xl bg-[#f2b705] px-5 py-3 text-sm font-bold text-black">+ Nouvel événement</Link><Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">+ Nouvelle tâche</Link></div></header>
    <div className="mb-8"><GoogleCalendarConnection /></div>
    <CalendarDataWarning sources={errors} />
    <CalendarCommandCenter items={items} />
  </main>;
}
