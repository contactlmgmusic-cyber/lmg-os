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
    { href: "/admin", label: "Dashboard Admin" },
    { href: "/executive", label: "Executive" },

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
    { href: "/medias", label: "CRM Médias" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/rollout", label: "Rollout" },
    { href: "/artistes", label: "Artistes" },
    { href: "/projets", label: "Projets" },
    { href: "/booking", label: "Booking" },
    { href: "/drive", label: "Drive" },
    { href: "/contrats", label: "Contrats" },
    { href: "/finances", label: "Finances" },
    { href: "/assistant", label: "Assistant IA" },
    { href: "/chat", label: "Chat" },
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
  <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-zinc-900 bg-black p-6 text-white">
    <Link href="/" className="mb-8 shrink-0">
      <h1 className="text-5xl font-black tracking-tight">LMG OS</h1>

      <p className="mt-2 text-sm text-zinc-500">
        Label Management System
      </p>
    </Link>

    {role !== "artist" && (
      <div className="shrink-0">
        <GlobalSearch />
      </div>
    )}

    <nav className="mt-8 flex-1 overflow-y-auto pr-1">
      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

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
      </div>
    </nav>

{role !== "artist" && (
  <div className="mb-4 shrink-0">
    <NotificationsBell />
  </div>
)}
    <div className="mt-4 shrink-0">
      <LogoutButton />
    </div>
  </aside>
);
}