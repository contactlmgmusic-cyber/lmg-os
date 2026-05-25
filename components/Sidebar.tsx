"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/",
    label: "Dashboard",
  },
  {
    href: "/artistes",
    label: "Artistes",
  },
  {
    href: "/projets",
    label: "Projets",
  },
  {
    href: "/taches",
    label: "Tâches",
  },
  {
    href: "/rollout",
    label: "Rollout",
  },
  {
    href: "/drive",
    label: "Drive",
  },
  {
    href: "/assistant",
    label: "Assistant IA",
  },
  {
    href: "/equipe",
    label: "Équipe",
  },
  {
    href: "/invitations",
    label: "Invitations",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 overflow-y-auto border-r border-zinc-800 bg-black p-6 text-white">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
          LMG
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          LMG OS
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Label Management System
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 transition ${
                active
                  ? "bg-white font-semibold text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-500">
          Système connecté
        </p>

        <p className="mt-2 text-lg font-semibold">
          LMG OS v1
        </p>

        <p className="mt-3 text-sm text-zinc-500">
          Gestion artistes, projets, tâches, rollout et IA.
        </p>
      </div>
    </aside>
  );
}