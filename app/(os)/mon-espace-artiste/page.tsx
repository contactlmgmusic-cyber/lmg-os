import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function statusTone(status?: string | null) {
  const value = (status || "").toLowerCase();
  if (value.includes("termin") || value.includes("confirm") || value.includes("sign")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (value.includes("cours") || value.includes("attente")) return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

export default async function MonEspaceArtistePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { getAll: () => cookieStore.getAll(), setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, nom, role, artiste_id").eq("id", user.id).single();
  if (profile?.role !== ROLES.ARTISTE) redirect("/dashboard");
  if (!profile.artiste_id) {
    return <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10"><p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Espace artiste</p><h1 className="mt-4 text-4xl font-bold">Compte en attente de liaison</h1><p className="mt-3 text-zinc-500">Aucun profil artiste n’est encore lié à ton compte.</p></main>;
  }

  const artistId = profile.artiste_id;
  const [artistResult, projectsResult, tasksResult, royaltiesResult, contractsResult, bookingsResult, releasesResult, analyticsResult, filesResult, goalsResult] = await Promise.all([
    supabase.from("artistes").select("*").eq("id", artistId).single(),
    supabase.from("projets").select("*").eq("artiste_id", artistId).order("created_at", { ascending: false }),
    supabase.from("taches").select("*, task_assignees(user_id)").order("created_at", { ascending: false }),
    supabase.from("royalties").select("*").eq("email", user.email),
    supabase.from("contrats").select("*").eq("artiste_id", artistId).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").eq("artiste_id", artistId).order("date_event", { ascending: true }),
    supabase.from("sorties").select("*").eq("artiste_id", artistId).order("date_sortie", { ascending: false }),
    supabase.from("analytics").select("*").eq("artiste_id", artistId),
    supabase.from("drive_files").select("*").eq("artiste_id", artistId).order("created_at", { ascending: false }),
    supabase.from("objectifs_artistes").select("*").eq("artiste_id", artistId).order("created_at", { ascending: false }),
  ]);

  const artiste = artistResult.data;
  const projets = projectsResult.data || [];
  const taches = (tasksResult.data || []).filter((task: any) =>
    task.responsable_id === profile.id ||
    task.assigned_to === profile.id ||
    task.task_assignees?.some((assignment: { user_id: string }) => assignment.user_id === profile.id)
  );
  const royalties = royaltiesResult.data || [];
  const contrats = contractsResult.data || [];
  const bookings = bookingsResult.data || [];
  const sorties = releasesResult.data || [];
  const analytics = analyticsResult.data || [];
  const driveFiles = filesResult.data || [];
  const objectifs = goalsResult.data || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openTasks = taches.filter((task: any) => !["terminé", "termine", "done"].includes((task.statut || "").toLowerCase()));
  const nextTask = [...openTasks].filter((task: any) => task.deadline).sort((a: any, b: any) => +new Date(a.deadline) - +new Date(b.deadline))[0];
  const nextBooking = bookings.find((booking: any) => booking.date_event && new Date(booking.date_event) >= today && booking.statut !== "Annulé");
  const nextRelease = [...sorties].filter((release: any) => release.date_sortie && new Date(release.date_sortie) >= today).sort((a: any, b: any) => +new Date(a.date_sortie) - +new Date(b.date_sortie))[0];
  const royaltiesPending = royalties.filter((item: any) => item.statut !== "Payé").reduce((sum: number, item: any) => sum + Number(item.montant_du || 0), 0);
  const totalStreams = analytics.reduce((sum: number, item: any) => sum + Number(item.streams || 0), 0);
  const totalViews = analytics.reduce((sum: number, item: any) => sum + Number(item.vues || 0), 0);
  const goalsReached = objectifs.filter((goal: any) => Number(goal.objectif || 0) > 0 && Number(goal.actuel || 0) >= Number(goal.objectif || 0)).length;
  const goalProgress = objectifs.length ? Math.round((goalsReached / objectifs.length) * 100) : 0;

  const quickLinks = [
    { href: "/mon-espace-artiste/calendrier", label: "Calendrier", detail: nextBooking ? formatDate(nextBooking.date_event) : "Aucune date" },
    { href: "/mon-espace-artiste/validations", label: "Validations", detail: "Décisions en attente" },
    { href: "/mon-espace-artiste/documents", label: "Documents", detail: `${driveFiles.length} fichier${driveFiles.length > 1 ? "s" : ""}` },
    { href: "/mon-espace-artiste/royalties", label: "Royalties", detail: `${royaltiesPending.toFixed(0)} € à recevoir` },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-zinc-900 px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 md:h-24 md:w-24">
              {artiste?.photo_url ? <img src={artiste.photo_url} alt={artiste.nom || "Artiste"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold text-zinc-600">{(artiste?.nom || "A").slice(0, 1)}</div>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">Espace artiste · Vue globale</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Bonsoir, {artiste?.nom || profile.nom || "Artiste"}</h1>
              <p className="mt-3 text-zinc-500">Ton activité, tes prochaines actions et tes données essentielles.</p>
            </div>
          </div>
          <Link href="/chat" className="w-fit rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-zinc-500 hover:bg-zinc-900">Contacter mon équipe</Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-6 py-8 md:px-10 md:py-10">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-yellow-500/50 hover:bg-zinc-900"><div className="flex items-center justify-between"><p className="font-semibold">{item.label}</p><span className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-yellow-400">→</span></div><p className="mt-2 text-sm text-zinc-500">{item.detail}</p></Link>)}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
            <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">À faire maintenant</p><h2 className="mt-3 text-2xl font-bold md:text-3xl">Tes prochaines actions</h2></div><span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{openTasks.length} ouverte{openTasks.length > 1 ? "s" : ""}</span></div>
            <div className="mt-7 divide-y divide-zinc-800">
              {openTasks.length === 0 ? <p className="py-8 text-zinc-500">Aucune tâche en attente. Ton espace est à jour.</p> : openTasks.slice(0, 5).map((task: any) => <Link key={task.id} href={`/taches/${task.id}`} className="flex flex-col gap-3 py-5 transition first:pt-0 hover:opacity-80 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{task.titre}</p><p className="mt-1 line-clamp-1 text-sm text-zinc-500">{task.description || "Aucune consigne complémentaire"}</p></div><div className="flex items-center gap-3"><span className={`rounded-full border px-3 py-1 text-xs ${statusTone(task.statut)}`}>{task.statut || "À faire"}</span><span className="whitespace-nowrap text-sm text-zinc-500">{formatDate(task.deadline)}</span></div></Link>)}
            </div>
          </div>

          <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-500">Prochaine échéance</p>
            <h2 className="mt-4 text-2xl font-bold">{nextTask?.titre || nextRelease?.titre || nextBooking?.evenement || "Rien d’urgent"}</h2>
            <p className="mt-2 text-zinc-500">{nextTask ? `Tâche · ${formatDate(nextTask.deadline)}` : nextRelease ? `Sortie · ${formatDate(nextRelease.date_sortie)}` : nextBooking ? `Événement · ${formatDate(nextBooking.date_event)}` : "Aucune échéance planifiée"}</p>
            <div className="mt-8 border-t border-zinc-800 pt-6"><p className="text-sm text-zinc-500">Objectifs atteints</p><div className="mt-3 flex items-end justify-between"><p className="text-4xl font-bold">{goalProgress}%</p><p className="text-sm text-zinc-600">{goalsReached}/{objectifs.length}</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${goalProgress}%` }} /></div></div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Streams" value={totalStreams.toLocaleString("fr-FR")} detail="Cumul renseigné" />
          <Metric label="Vues" value={totalViews.toLocaleString("fr-FR")} detail="Toutes plateformes" />
          <Metric label="Projets actifs" value={String(projets.filter((project: any) => !["Terminé", "Archivé"].includes(project.statut)).length)} detail={`${projets.length} au total`} />
          <Metric label="Contrats" value={String(contrats.length)} detail={`${contrats.filter((contract: any) => contract.statut === "Signé").length} signé(s)`} />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <Panel title="Mes projets" eyebrow="Développement">
            {projets.length === 0 ? <Empty label="Aucun projet disponible." /> : projets.slice(0, 4).map((project: any) => <div key={project.id} className="flex items-center justify-between gap-4 border-b border-zinc-800 py-4 last:border-0"><div><p className="font-semibold">{project.titre}</p><p className="mt-1 text-sm text-zinc-500">{project.type || "Projet artistique"} · {formatDate(project.date_sortie)}</p></div><span className={`rounded-full border px-3 py-1 text-xs ${statusTone(project.statut)}`}>{project.statut || "En préparation"}</span></div>)}
          </Panel>
          <Panel title="Agenda à venir" eyebrow="Planning">
            {bookings.filter((booking: any) => booking.date_event && new Date(booking.date_event) >= today).length === 0 ? <Empty label="Aucune date programmée." /> : bookings.filter((booking: any) => booking.date_event && new Date(booking.date_event) >= today).slice(0, 4).map((booking: any) => <Link href="/mon-espace-artiste/evenements" key={booking.id} className="flex items-center justify-between gap-4 border-b border-zinc-800 py-4 last:border-0"><div><p className="font-semibold">{booking.evenement}</p><p className="mt-1 text-sm text-zinc-500">{booking.ville || "Lieu à confirmer"}</p></div><p className="whitespace-nowrap text-sm text-zinc-400">{formatDate(booking.date_event)}</p></Link>)}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight">{value}</p><p className="mt-2 text-xs text-zinc-600">{detail}</p></div>;
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">{eyebrow}</p><h2 className="mt-3 text-2xl font-bold">{title}</h2><div className="mt-5">{children}</div></div>;
}

function Empty({ label }: { label: string }) {
  return <p className="py-6 text-sm text-zinc-500">{label}</p>;
}
