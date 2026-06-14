"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import LogoutButton from "./LogoutButton";
import NotificationsBell from "./NotificationsBell";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ROLES } from "@/lib/roles";
import Image from "next/image";



export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [newCandidatures, setNewCandidatures] = useState(0);

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

    async function loadUnreadCount() {
      const { count } = await supabaseBrowser
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("lu", false);

      setUnreadNotifications(count || 0);
    }

    await loadUnreadCount();

    const channel = supabaseBrowser
      .channel("sidebar-notifications-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        async () => {
          await loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }

  fetchUserData();
}, []);

  const superAdminLinks = [
  { href: "/dashboard", label: "Dashboard CEO" },
  { href: "/admin", label: "Administration" },
  { href: "/manager/kpi", label: "KPI Manager" },
  { href: "/dashboard/candidatures", label: "Candidatures" },
  { href: "/notifications", label: "Notifications" },

  { href: "/artistes", label: "Artistes" },
  { href: "/validations-artiste", label: "Validations artistes" },
  { href: "/contrats/validations", label: "Validations contrats" },
  { href: "/artistes/ranking", label: "Ranking Artistes" },
  { href: "/projets", label: "Projets" },
  { href: "/sorties", label: "Sorties" },
  { href: "/release-planner", label: "Release Planner" },
  { href: "/objectifs", label: "Objectifs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/analytics/dashboard", label: "Analytics Dashboard" },
  { href: "/analytics/graphs", label: "Analytics Graphs" },

  { href: "/booking", label: "Booking" },
  { href: "/campagnes", label: "Campagnes" },
  { href: "/partenaires", label: "CRM Partenaires" },
  { href: "/influenceurs", label: "CRM Influenceurs" },
  { href: "/medias", label: "CRM Médias" },

  { href: "/contrats", label: "Contrats" },
  { href: "/splits", label: "Split Sheets" },
  { href: "/royalties", label: "Royalties" },
  { href: "/finances", label: "Finances" },

  { href: "/taches", label: "Tâches" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/calendrier/global", label: "Calendrier global" },
  { href: "/artiste-events", label: "Événements artistes" },
  { href: "/rollout", label: "Rollout" },
  { href: "/drive", label: "Drive" },

  { href: "/assistant", label: "Assistant IA" },
  { href: "/chat", label: "Chat" },
  { href: "/equipe", label: "Équipe" },
  { href: "/invitations", label: "Invitations" },
];

const adminLinks = superAdminLinks.filter(
  (link) => link.href !== "/admin" && link.href !== "/invitations"
);

const managerLinks = [
  { href: "/manager", label: "Dashboard Manager" },
  { href: "/manager/kpi", label: "KPI Manager" },
  { href: "/notifications", label: "Notifications" },

  { href: "/artistes", label: "Mes artistes" },
  { href: "/contrats/validations", label: "Validations contrats" },
  { href: "/artistes/ranking", label: "Ranking Artistes" },
  { href: "/validations-artiste", label: "Validations artistes" },
  { href: "/projets", label: "Projets" },
  { href: "/sorties", label: "Sorties" },
  { href: "/release-planner", label: "Release Planner" },
  { href: "/objectifs", label: "Objectifs" },
  { href: "/analytics", label: "Analytics" },

  { href: "/booking", label: "Booking" },
  { href: "/influenceurs", label: "CRM Influenceurs" },
  { href: "/medias", label: "CRM Médias" },
  { href: "/campagnes", label: "Campagnes" },

  { href: "/contrats", label: "Contrats" },
  { href: "/splits", label: "Split Sheets" },
  { href: "/royalties", label: "Royalties" },

  { href: "/taches", label: "Tâches" },
  { href: "/mes-taches", label: "Mes tâches" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/artiste-events/nouveau", label: "Nouvel événement artiste" },
  { href: "/calendrier/global", label: "Calendrier global" },
  { href: "/rollout", label: "Rollout" },
  { href: "/drive", label: "Drive" },
  { href: "/chat", label: "Chat" },
];

const artisteLinks = [
  { href: "/mon-espace-artiste", label: "Mon espace artiste" },
  { href: "/mon-espace-artiste/validations", label: "Mes validations" },
  { href: "/mon-espace-artiste/contrats", label: "Mes contrats" },
  { href: "/mon-espace-artiste/calendrier", label: "Mon calendrier" },
  { href: "/mon-espace-artiste/evenements", label: "Mes événements" },
  { href: "/notifications", label: "Notifications" },
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
    : role === ROLES.ADMIN
    ? adminLinks
    : superAdminLinks;

const canUseGlobalTools =
  role === ROLES.SUPER_ADMIN ||
  role === ROLES.ADMIN ||
  role === ROLES.MANAGER;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto border-r border-zinc-900 bg-black p-6 text-white">
      <div className="mb-8 flex items-center gap-4">
  <Image
    src="/logo-lmg.png"
    alt="Legacy Music Group"
    width={70}
    height={70}
    priority
  />

  <div>
    <h1 className="text-xl font-bold leading-tight text-white">
      Legacy Music Group
    </h1>

    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">
      Operating System
    </p>
  </div>
</div>

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
            const isCandidatures = link.href === "/dashboard/candidatures";

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

                {isCandidatures && newCandidatures > 0 && (
  <span
    className={`rounded-full px-2 py-1 text-xs font-bold ${
      active ? "bg-black text-white" : "bg-yellow-500 text-black"
    }`}
  >
    {newCandidatures}
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