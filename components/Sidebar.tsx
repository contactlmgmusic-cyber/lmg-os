"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import LogoutButton from "./LogoutButton";
import NotificationsBell from "./NotificationsBell";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";


export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || null);

      const { count } = await supabaseBrowser
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadNotifications(count || 0);
    }

    fetchUserData();
  }, []);

  const superAdminLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/admin", label: "Administration" },
    { href: "/notifications", label: "Notifications" },
    { href: "/artistes", label: "Artistes" },
    { href: "/projets", label: "Projets" },
    { href: "/booking", label: "Booking" },
    { href: "/medias", label: "CRM Médias" },
    { href: "/contrats", label: "Contrats" },
    { href: "/splits", label: "Split Sheets" },
    { href: "/royalties", label: "Royalties" },
    { href: "/finances", label: "Finances" },
    { href: "/taches", label: "Tâches" },
    { href: "/mes-taches", label: "Mes tâches" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/rollout", label: "Rollout" },
    { href: "/drive", label: "Drive" },
    { href: "/assistant", label: "Assistant IA" },
    { href: "/chat", label: "Chat" },
    { href: "/equipe", label: "Équipe" },
    { href: "/invitations", label: "Invitations" },
  ];

  const managerLinks = [
    { href: "/manager", label: "Dashboard Manager" },
    { href: "/notifications", label: "Notifications" },
    { href: "/artistes", label: "Mes artistes" },
    { href: "/projets", label: "Projets" },
    { href: "/booking", label: "Booking" },
    { href: "/medias", label: "CRM Médias" },
    { href: "/contrats", label: "Contrats" },
    { href: "/splits", label: "Split Sheets" },
    { href: "/royalties", label: "Royalties" },
    { href: "/taches", label: "Tâches" },
    { href: "/mes-taches", label: "Mes tâches" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/drive", label: "Drive" },
    { href: "/chat", label: "Chat" },
  ];

  const artisteLinks = [
    { href: "/mon-espace-artiste", label: "Mon espace artiste" },
    { href: "/notifications", label: "Notifications" },
    { href: "/projets", label: "Mes projets" },
    { href: "/contrats", label: "Mes contrats" },
    { href: "/royalties", label: "Mes royalties" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/chat", label: "Chat" },
  ];

  const prestataireLinks = [
    { href: "/notifications", label: "Notifications" },
    { href: "/mes-taches", label: "Mes tâches" },
    { href: "/drive", label: "Drive" },
    { href: "/calendrier", label: "Calendrier" },
    { href: "/chat", label: "Chat" },
  ];

  const links =
    role === ROLES.ARTISTE
      ? artisteLinks
      : role === ROLES.MANAGER
      ? managerLinks
      : role === ROLES.PRESTATAIRE
      ? prestataireLinks
      : superAdminLinks;

  const canUseGlobalTools =
    role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.MANAGER;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-zinc-900 bg-black p-6 text-white">
      <Link href="/" className="mb-8 shrink-0">
        <h1 className="text-5xl font-black tracking-tight">LMG OS</h1>
        <p className="mt-2 text-sm text-zinc-500">Label Management System</p>
      </Link>

      {canUseGlobalTools && (
        <div className="shrink-0">
          <GlobalSearch />
        </div>
      )}

      <nav className="mt-8 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            const isNotifications = link.href === "/notifications";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-lg transition ${
                  active
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span>{link.label}</span>

                {isNotifications && unreadNotifications > 0 && (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      active
                        ? "bg-black text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {canUseGlobalTools && (
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