import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

type Task = {
  id: string;
  titre: string;
  deadline: string | null;
  priorite: string | null;
  statut: string | null;
};

type Activity = {
  id: string;
  titre: string | null;
  description: string | null;
  type: string | null;
  created_at: string;
};

export default async function MobileHomePage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = isoDate(new Date());
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndIso = isoDate(weekEnd);

  const [profileRes, tasksRes, projectsRes, notificationsRes, activityRes, bookingsRes] =
    await Promise.all([
      supabase.from("profiles").select("nom, full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("taches")
        .select("id, titre, deadline, priorite, statut")
        .eq("responsable_id", user.id)
        .neq("statut", "Terminé")
        .order("deadline", { ascending: true, nullsFirst: false })
        .limit(8),
      supabase
        .from("internal_projects")
        .select("id, titre, pole, statut, progression, deadline")
        .not("statut", "in", '("Terminé","Archivé")')
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or("is_read.eq.false,lu.eq.false"),
      supabase
        .from("activity_logs")
        .select("id, titre, description, type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("statut", "Confirmé")
        .gte("date_event", today)
        .lte("date_event", weekEndIso),
    ]);

  const tasks = (tasksRes.data || []) as Task[];
  const activities = (activityRes.data || []) as Activity[];
  const projects = projectsRes.data || [];
  const lateTasks = tasks.filter((task) => task.deadline && task.deadline < today);
  const weekTasks = tasks.filter(
    (task) => task.deadline && task.deadline >= today && task.deadline <= weekEndIso
  );
  const firstName = (profileRes.data?.nom || profileRes.data?.full_name || "").split(" ")[0];
  const greeting = getGreeting();

  return (
    <div className="px-5 py-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#f2b705]/20 bg-[#11100b] p-6">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#f2b705]/10 blur-3xl" />
        <p className="relative text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">
          {currentDay()} · LMG Music
        </p>
        <h1 className="relative mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em]">
          {greeting}{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="relative mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          Voici ce qui mérite ton attention dans l’écosystème LMG aujourd’hui.
        </p>

        <div className="relative mt-6 grid grid-cols-3 gap-2">
          <Metric value={lateTasks.length} label="En retard" tone={lateTasks.length ? "danger" : "neutral"} />
          <Metric value={weekTasks.length} label="Cette semaine" tone="gold" />
          <Metric value={notificationsRes.count || 0} label="Non lues" tone="neutral" />
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader eyebrow="À traiter" title="Tes priorités" href="/taches" />
        <div className="mt-4 space-y-2">
          {tasks.length ? tasks.slice(0, 4).map((task) => (
            <Link
              key={task.id}
              href={`/taches/${task.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 active:scale-[0.99]"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${task.deadline && task.deadline < today ? "bg-red-500" : task.priorite === "Haute" || task.priorite === "Urgente" ? "bg-[#f2b705]" : "bg-zinc-700"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{task.titre}</p>
                <p className="mt-1 text-xs text-zinc-600">{task.deadline ? formatDay(task.deadline) : "Sans échéance"}</p>
              </div>
              <span className="text-zinc-700">›</span>
            </Link>
          )) : <EmptyState text="Aucune tâche ouverte ne t’est attribuée." />}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Pilotage" title="Projets en mouvement" href="/mobile/projets" />
        <div className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
          {projects.length ? projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projets-internes/${project.id}`}
              className="w-[250px] shrink-0 snap-start rounded-[22px] border border-white/[0.07] bg-[#0f0f0f] p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#f2b705]">{project.pole || "LMG"}</p>
                <span className="text-[10px] font-bold text-zinc-600">{project.progression || 0}%</span>
              </div>
              <h2 className="mt-5 line-clamp-2 min-h-11 text-lg font-black leading-tight">{project.titre}</h2>
              <div className="mt-5 h-1 overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full rounded-full bg-[#f2b705]" style={{ width: `${Math.min(100, Math.max(0, Number(project.progression || 0)))}%` }} />
              </div>
              <p className="mt-3 text-[11px] text-zinc-600">{project.statut || "En cours"}</p>
            </Link>
          )) : <div className="w-full"><EmptyState text="Aucun projet actif à afficher." /></div>}
        </div>
      </section>

      <section className="mt-8">
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/chat" label="Écrire à l’équipe" detail="Chat interne" symbol="↗" />
          <QuickAction href="/taches/nouveau" label="Ajouter une tâche" detail="Action rapide" symbol="+" />
          <QuickAction href="/mobile/agenda" label="Voir l’agenda" detail={`${bookingsRes.count || 0} booking(s) cette semaine`} symbol="→" />
          <QuickAction href="/validations-artiste" label="Validations" detail="À contrôler" symbol="✓" />
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Temps réel" title="Activité récente" href="/activity" />
        <div className="mt-4 rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4">
          {activities.length ? activities.map((activity) => (
            <article key={activity.id} className="flex gap-3 border-b border-white/[0.06] py-4 last:border-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f2b705]" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{activity.titre || "Activité LMG"}</p>
                {activity.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{activity.description}</p>}
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-700">{relativeDate(activity.created_at)}</p>
              </div>
            </article>
          )) : <div className="py-8"><EmptyState text="Aucune activité récente." /></div>}
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone: "danger" | "gold" | "neutral" }) {
  const tones = { danger: "text-red-400", gold: "text-[#f2b705]", neutral: "text-white" };
  return <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-3 py-4 text-center"><p className={`text-2xl font-black ${tones[tone]}`}>{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">{label}</p></div>;
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f2b705]">{eyebrow}</p><h2 className="mt-1.5 text-xl font-black tracking-[-0.02em]">{title}</h2></div><Link href={href} className="pb-0.5 text-xs font-bold text-zinc-600">Voir tout</Link></div>;
}

function QuickAction({ href, label, detail, symbol }: { href: string; label: string; detail: string; symbol: string }) {
  return <Link href={href} className="min-h-32 rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2b705] text-sm font-black text-black">{symbol}</span><p className="mt-5 text-sm font-black">{label}</p><p className="mt-1 text-[11px] leading-4 text-zinc-600">{detail}</p></Link>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-7 text-center text-xs text-zinc-600">{text}</div>;
}

function isoDate(date: Date) { return date.toISOString().split("T")[0]; }
function formatDay(value: string) { return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`)); }
function getGreeting() { const hour = new Date().getHours(); return hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"; }
function currentDay() { const value = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date()); return value.charAt(0).toUpperCase() + value.slice(1); }
function relativeDate(value: string) { const diff = Date.now() - new Date(value).getTime(); const minutes = Math.floor(diff / 60000); if (minutes < 1) return "À l’instant"; if (minutes < 60) return `Il y a ${minutes} min`; const hours = Math.floor(minutes / 60); if (hours < 24) return `Il y a ${hours} h`; return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value)); }
