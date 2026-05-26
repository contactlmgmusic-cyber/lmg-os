"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import LogoutButton from "./LogoutButton";
import { supabaseBrowser } from "@/lib/supabase-browser";

const allLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/manager", label: "Dashboard Manager" },
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

      setRole(data?.role || "member");
    }

    fetchRole();
  }, []);

  const links = role === "artist" ? artistLinks : allLinks;

  return (
    <aside className="h-screen w-72 overflow-y-auto border-r border-zinc-800 bg-black p-6 text-white">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
          LMG
        </p>

        <h1 className="mt-2 text-4xl font-bold">LMG OS</h1>

        <p className="mt-3 text-sm text-zinc-500">
          Label Management System
        </p>
      </div>

      {role !== "artist" && <GlobalSearch />}

      <nav className="space-y-2">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

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
        <p className="text-sm text-zinc-500">Connecté en tant que</p>

        <p className="mt-2 text-lg font-semibold">
          {role || "chargement..."}
        </p>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </aside>
  );
}