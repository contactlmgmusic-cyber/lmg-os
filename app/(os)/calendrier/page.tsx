import Link from "next/link";
import CalendarFilterView from "@/components/CalendarFilterView";
import CalendarDataWarning from "@/components/CalendarDataWarning";
import { loadCalendar } from "@/lib/calendar.server";
import { calendarDateKey, validMonth } from "@/lib/calendar-dates";
import { requireRole } from "@/lib/require-role.server";
import { INTERNAL_ROLES, ROLES } from "@/lib/roles";
export const dynamic = "force-dynamic";
export default async function CalendrierPage({ searchParams }: { searchParams: Promise<{ mois?: string }> }) {
  const profile = await requireRole(INTERNAL_ROLES);
  const { items, errors } = await loadCalendar(profile);
  const requested = validMonth((await searchParams).mois);
  const [year, month] = requested.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = calendarDateKey(new Date());
  const monthKey = (offset: number) => new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0,7);
  const canCreate = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR].includes(profile.role as any);
  const canCreateEvent = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR].includes(profile.role as any);
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
    <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">LMG Workspace</p><h1 className="text-4xl font-bold capitalize tracking-tight md:text-6xl">{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(first)}</h1><p className="mt-3 text-zinc-400">Toutes les dates et échéances accessibles dans ton espace.</p></div>
      <div className="flex flex-wrap gap-3">{[[monthKey(-1), "← Mois précédent"], [today.slice(0,7), "Aujourd’hui"], [monthKey(1), "Mois suivant →"]].map(([key,label]) => <Link key={label} href={`/calendrier?mois=${key}`} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold">{label}</Link>)}{canCreateEvent && <Link href="/evenements/nouveau" className="rounded-xl bg-[#f2b705] px-5 py-3 text-sm font-semibold text-black">+ Nouvel événement</Link>}{canCreate && <Link href="/taches/nouveau" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">+ Nouvelle tâche</Link>}</div>
    </div>
    <CalendarDataWarning sources={errors} />
    <CalendarFilterView days={[
      ...Array.from({ length: (first.getUTCDay() + 6) % 7 }, (_, i) => ({ key: `empty-${i}`, day: "", isToday: false })),
      ...Array.from({ length: count }, (_, i) => { const key = `${requested}-${String(i+1).padStart(2,"0")}`; return { key, day: String(i+1).padStart(2,"0"), isToday: key === today }; }),
    ]} events={items.map(item => ({ id: item.id, title: item.titre, date: item.date, type: item.type, category: item.category, href: item.link, color: "" }))} />
  </main>;
}
