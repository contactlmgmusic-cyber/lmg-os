import Link from "next/link";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

const channels = [
  {
    href: "/chat",
    eyebrow: "Équipe",
    title: "Chat d’équipe",
    description:
      "Centralisez les échanges collectifs dans les canaux LMG et gardez les décisions accessibles à toute l’équipe concernée.",
    action: "Ouvrir les canaux",
    color: "yellow",
  },
  {
    href: "/chat/prive",
    eyebrow: "Direct",
    title: "Messages privés",
    description:
      "Échangez directement avec un membre de l’équipe sans mélanger les sujets personnels aux discussions collectives.",
    action: "Voir les conversations",
    color: "violet",
  },
  {
    href: "/notifications",
    eyebrow: "Suivi",
    title: "Notifications",
    description:
      "Retrouvez les informations importantes, les alertes et les actions qui nécessitent votre attention dans LMG OS.",
    action: "Traiter les notifications",
    color: "cyan",
  },
] as const;

const colorClasses = {
  yellow: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
};

export default async function CommunicationPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR]);
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 xl:px-10 xl:py-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[30px] border border-zinc-800 bg-zinc-950 p-6 sm:p-8 xl:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-yellow-400">
            Communication · Interne
          </p>
          <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_380px] xl:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Le point d’entrée des échanges LMG
              </h1>
              <p className="mt-4 max-w-3xl text-zinc-400">
                LMG OS concentre désormais uniquement la communication interne. Les e-mails externes restent gérés dans Gmail pour garder un fonctionnement simple, clair et fiable.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Organisation active
              </p>
              <p className="mt-2 font-semibold text-white">
                Gmail pour l’externe · LMG OS pour l’interne
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 xl:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel.href}
              href={channel.href}
              className="group flex min-h-64 flex-col rounded-[26px] border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-900 sm:p-7"
            >
              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${colorClasses[channel.color]}`}
              >
                {channel.eyebrow}
              </span>
              <h2 className="mt-6 text-2xl font-bold">
                {channel.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">
                {channel.description}
              </p>
              <span className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-5 text-sm font-semibold text-zinc-200">
                {channel.action}
                <span
                  className="text-xl text-yellow-400 transition group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-5 rounded-[26px] border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Règle de fonctionnement
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Un canal pour chaque usage
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Usage number="01" title="Décision collective" text="Chat d’équipe" />
              <Usage number="02" title="Échange confidentiel" text="Message privé" />
              <Usage number="03" title="Action à suivre" text="Notification ou tâche" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Usage({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <span className="text-xs font-bold text-yellow-400">{number}</span>
      <p className="mt-4 font-semibold text-zinc-100">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}
