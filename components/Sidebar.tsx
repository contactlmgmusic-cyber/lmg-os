"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import LogoutButton from "./LogoutButton";
import { supabaseBrowser } from "@/lib/supabase-browser";
import NotificationsBell from "./NotificationsBell";

export default function Sidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;

      const { data } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role) {
        setRole(data.role);
      }
    }

    fetchRole();
  }, []);

  const allLinks = [
    { href: "/", label: "Dashboard" },

    ...(role !== "artist"
      ? [
          {
            href: "/manager",
            label: "Dashboard Manager",
          },
        ]
      : []),

    { href: "/mes-taches", label: "Mes tâches" },
    { href: "/taches", label: "Tâches" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/rollout", label: "Rollout" },
    { href: "/artistes", label: "Artistes" },
    { href: "/projets", label: "Projets" },
    { href: "/drive", label: "Drive" },
    { href: "/assistant", label: "Assistant IA" },
    { href: "/mon-espace-artiste", label: "Mon espace artiste" },
    { href: "/equipe", label: "Équipe" },
    { href: "/invitations", label: "Invitations" },
  ];

  const artistLinks = [
    { href: "/mon-espace-artiste", label: "Mon espace artiste" },
    { href: "/artistes", label: "Artistes" },
    { href: "/projets", label: "Projets" },
  ];

  const links =
    role === "artist"
      ? artistLinks
      : allLinks;

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-zinc-900 bg-black p-6 text-white">
      <Link href="/" className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">
          LMG OS
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Label Management System
        </p>
      </Link>

      <GlobalSearch />

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-lg transition ${
                active
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

<div className="mb-4">
  <NotificationsBell />
</div>

      <LogoutButton />
    </aside>
  );
}