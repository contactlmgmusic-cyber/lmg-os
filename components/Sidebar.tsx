"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

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
    label: "Rollout",
  },
  {
    href: "/booking",
    label: "Booking",
  },
  {
    href: "/calendrier",
    label: "Calendrier",
  },
  {
    href: "/contrats",
    label: "Contrats",
  },
  {
    href: "/finances",
    label: "Finances",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-black border-r border-zinc-800 flex flex-col justify-between p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-10">
          LMG OS
        </h1>

        <nav className="space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white text-black font-medium"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-10">
        <LogoutButton />
      </div>
    </aside>
  );
}