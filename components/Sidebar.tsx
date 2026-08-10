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

type SidebarLink = {
  href: string;
  label: string;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

export default function Sidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChatNotifications, setUnreadChatNotifications] = useState(0);
  const [newCandidatures, setNewCandidatures] = useState(0);

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || "");
      setAvatarUrl(
  user.user_metadata?.avatar_url || ""
);

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role, nom")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || null);
      setUserName(
  profile?.nom ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Utilisateur"
);

      async function loadCounts(userId: string) {
        const { count: notificationsCount } = await supabaseBrowser
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .or("lu.eq.false,is_read.eq.false");

        setUnreadNotifications(notificationsCount || 0);

        const { count: chatCount } = await supabaseBrowser
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("type", "Chat")
          .or("lu.eq.false,is_read.eq.false");

        setUnreadChatNotifications(chatCount || 0);

        const { count: candidaturesCount } = await supabaseBrowser
          .from("candidatures")
          .select("*", { count: "exact", head: true })
          .eq("statut", "Nouvelle");

        setNewCandidatures(candidaturesCount || 0);
      }

      await loadCounts(user.id);

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
            await loadCounts(user.id);
          }
        )
        .subscribe();

      return () => {
        supabaseBrowser.removeChannel(channel);
      };
    }

    fetchUserData();
  }, []);

  const superAdminSections: SidebarSection[] = [
  {
    title: "Pilotage",
    links: [
      { href: "/dashboard", label: "Dashboard CEO" },
      { href: "/manager/kpi", label: "KPI Manager" },
      { href: "/analytics/dashboard", label: "Analytics Dashboard" },
    ],
  },

  {
    title: "Artistes",
    links: [
      { href: "/artistes", label: "Artistes" },
      { href: "/artistes/ranking", label: "Ranking Artistes" },
      { href: "/objectifs-artistes", label: "Objectifs artistes" },
      { href: "/validations-artiste", label: "Validations artistes" },
      { href: "/contrats/validations", label: "Validations contrats" },
      { href: "/dashboard/candidatures", label: "Candidatures" },
    ],
  },

  {
    title: "Projets & Releases",
    links: [
      { href: "/projets", label: "Projets" },
      { href: "/sorties", label: "Sorties" },
      { href: "/release-planner", label: "Release Planner" },
      { href: "/rollout", label: "Rollout" },
      { href: "/objectifs", label: "Objectifs" },
    ],
  },

  {
    title: "Business",
    links: [
      { href: "/prospects", label: "CRM Prospects" },
      { href: "/booking", label: "Booking" },
      { href: "/campagnes", label: "Campagnes Marketing" },
      { href: "/partenaires", label: "CRM Partenaires" },
      { href: "/influenceurs", label: "CRM Influenceurs" },
      { href: "/medias", label: "CRM Médias" },
    ],
  },

  {
  title: "Finance & Juridique",
  links: [
    { href: "/finances/dashboard", label: "Finance Dashboard" },
    { href: "/finances", label: "Transactions" },
    { href: "/royalties", label: "Royalties" },
    { href: "/contrats", label: "Contrats" },
    { href: "/splits", label: "Split Sheets" },
  ],
},

  {
    title: "Opérations",
    links: [
      { href: "/taches", label: "Tâches" },
      { href: "/calendrier/global", label: "Calendrier global" },
      { href: "/artiste-events", label: "Événements artistes" },
      { href: "/drive", label: "Drive" },
    ],
  },

  {
    title: "LMG AI",
    links: [
      { href: "/assistant", label: "Assistant IA" },
      { href: "/assistant/chat", label: "Assistant IA central" },
      { href: "/assistant/rollout", label: "Générer un rollout" },
      { href: "/assistant/tiktok", label: "Stratégie TikTok" },
    ],
  },

  {
    title: "Communication",
    links: [
      { href: "/notifications", label: "Notifications" },
      { href: "/chat", label: "Chat équipe" },
      { href: "/chat/prive", label: "Messages privés" },
    ],
  },

  {
    title: "Administration",
    links: [
      { href: "/admin", label: "Administration" },
      { href: "/equipe", label: "Équipe" },
      { href: "/invitations", label: "Invitations" },
    ],
  },
];

const artisticDirectorSections: SidebarSection[] = [
  {
    title: "Pilotage",
    links: [
      { href: "/dashboard", label: "Dashboard Artistique" },
    ],
  },
  {
    title: "Artistes",
    links: [
      { href: "/artistes", label: "Artistes" },
      { href: "/artistes/ranking", label: "Ranking Artistes" },
      { href: "/objectifs-artistes", label: "Objectifs artistes" },
      { href: "/validations-artiste", label: "Validations artistes" },
    ],
  },
  {
    title: "Projets & Releases",
    links: [
      { href: "/projets", label: "Projets" },
      { href: "/sorties", label: "Sorties" },
      { href: "/release-planner", label: "Release Planner" },
      { href: "/rollout", label: "Rollout" },
      { href: "/objectifs", label: "Objectifs" },
    ],
  },
  {
    title: "Direction Artistique",
    links: [
      { href: "/campagnes", label: "Campagnes" },
      { href: "/royalties", label: "Royalties"},
      { href: "/partenaires", label: "CRM Partenaires" },
      { href: "/influenceurs", label: "CRM Influenceurs" },
      { href: "/medias", label: "CRM Médias" },
    ],
  },
  {
    title: "Production",
    links: [
      { href: "/taches", label: "Tâches" },
      { href: "/mes-taches", label: "Mes tâches" },
      { href: "/calendrier", label: "Calendrier" },
      { href: "/calendrier/global", label: "Calendrier global" },
      { href: "/artiste-events", label: "Événements artistes" },
      { href: "/drive", label: "Drive" },
    ],
  },
  {
    title: "Communication",
    links: [
      { href: "/notifications", label: "Notifications" },
      { href: "/chat", label: "Chat" },
      { href: "/chat/prive", label: "Messages privés" },
    ],
  },
];

  const artisteSections: SidebarSection[] = [
    {
      title: "Mon espace",
      links: [
        { href: "/mon-espace-artiste", label: "Dashboard artiste" },
        { href: "/mon-espace-artiste/calendrier", label: "Mon calendrier" },
        { href: "/mon-espace-artiste/evenements", label: "Mes événements" },
        { href: "/mon-espace-artiste/documents", label: "Mes documents" },
      ],
    },
    {
      title: "Validations & Contrats",
      links: [
        { href: "/mon-espace-artiste/validations", label: "Mes validations" },
        { href: "/mon-espace-artiste/contrats", label: "Mes contrats" },
      ],
    },
    {
      title: "Communication",
      links: [
        { href: "/notifications", label: "Notifications" },
        { href: "/chat", label: "Chat" },
        { href: "/chat/prive", label: "Messages privés" },
      ],
    },
  ];

  const prestataireSections: SidebarSection[] = [
    {
      title: "Travail",
      links: [
        { href: "/mes-taches", label: "Mes tâches" },
        { href: "/drive", label: "Drive" },
        { href: "/calendrier", label: "Calendrier" },
      ],
    },
    {
      title: "Communication",
      links: [
        { href: "/notifications", label: "Notifications" },
        { href: "/chat", label: "Chat" },
        { href: "/chat/prive", label: "Messages privés" },
      ],
    },
  ];

  const managerSections: SidebarSection[] = [
  {
    title: "Pilotage",
    links: [
      { href: "/dashboard", label: "Dashboard Manager" },
      { href: "/manager/kpi", label: "Mes KPI" },
    ],
  },

  {
    title: "Artistes",
    links: [
      { href: "/artistes", label: "Artistes" },
      { href: "/artistes/ranking", label: "Ranking Artistes" },
      { href: "/objectifs-artistes", label: "Objectifs artistes" },
    ],
  },

  {
    title: "Projets & Releases",
    links: [
      { href: "/projets", label: "Projets" },
      { href: "/sorties", label: "Sorties" },
      { href: "/release-planner", label: "Release Planner" },
      { href: "/rollout", label: "Rollout" },
    ],
  },

  {
    title: "Business",
    links: [
      { href: "/booking", label: "Booking" },
      { href: "/campagnes", label: "Campagnes" },
      { href: "/medias", label: "CRM Médias" },
      { href: "/influenceurs", label: "CRM Influenceurs" },
    ],
  },

  {
    title: "Finance",
    links: [
      { href: "/royalties", label: "Royalties" },
      { href: "/contrats", label: "Contrats" },
    ],
  },

  {
    title: "Communication",
    links: [
      { href: "/notifications", label: "Notifications" },
      { href: "/chat", label: "Chat" },
      { href: "/chat/prive", label: "Messages privés" },
    ],
  },
];


const adminSections: SidebarSection[] = [
  {
    title: "Administration",
    links: [
      { href: "/admin", label: "Administration" },
      { href: "/equipe", label: "Équipe" },
      { href: "/invitations", label: "Invitations" },
    ],
  },

  {
    title: "Pilotage",
    links: [
      { href: "/dashboard", label: "Dashboard CEO" },
      { href: "/analytics/dashboard", label: "Analytics Dashboard" },
    ],
  },

  {
    title: "Finance",
    links: [
      { href: "/finance/dashboard", label: "Finance Dashboard" },
      { href: "/finances", label: "Transactions" },
      { href: "/royalties", label: "Royalties" },
      { href: "/contrats", label: "Contrats" },
    ],
  },

  {
    title: "Communication",
    links: [
      { href: "/notifications", label: "Notifications" },
      { href: "/chat", label: "Chat" },
      { href: "/chat/prive", label: "Messages privés" },
    ],
  },
];


const sections =
  role === ROLES.ARTISTE
    ? artisteSections
    : role === ROLES.MANAGER
    ? managerSections
    : role === ROLES.ARTISTIC_DIRECTOR
    ? artisticDirectorSections
    : role === ROLES.PRESTATAIRE
    ? prestataireSections
    : role === ROLES.ADMIN
    ? adminSections
    : superAdminSections;

  const canUseGlobalTools =
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.MANAGER;

  function isActiveLink(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

const roleLabels: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Administrateur",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ARTISTIC_DIRECTOR]: "Direction artistique",
  [ROLES.ARTISTE]: "Artiste",
  [ROLES.PRESTATAIRE]: "Prestataire",
};

const roleLabel = role
  ? roleLabels[role] || role
  : "Chargement...";

const userInitials = userName
  .split(" ")
  .filter(Boolean)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase() || "LM";

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
        <div className="flex flex-col gap-7">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
                {section.title}
              </p>

              <div className="flex flex-col gap-2">
                {section.links.map((link) => {
                  const active = isActiveLink(link.href);
                  const isNotifications = link.href === "/notifications";
                  const isChat =
                    link.href === "/chat" || link.href === "/chat/prive";
                  const isCandidatures =
                    link.href === "/dashboard/candidatures";

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base transition ${
                        active
                          ? "bg-white text-black"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <span>{link.label}</span>

                      {isNotifications && unreadNotifications > 0 && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            active ? "bg-black text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {unreadNotifications}
                        </span>
                      )}

                      {isChat && unreadChatNotifications > 0 && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            active ? "bg-black text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {unreadChatNotifications}
                        </span>
                      )}

                      {isCandidatures && newCandidatures > 0 && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            active
                              ? "bg-black text-white"
                              : "bg-yellow-500 text-black"
                          }`}
                        >
                          {newCandidatures}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-6 shrink-0 border-t border-zinc-900 pt-5">
  <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
    Mon compte
  </p>

  <Link
    href="/profil"
    className={`block rounded-2xl border p-4 transition ${
      pathname === "/profil"
        ? "border-white bg-white text-black"
        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
  className={`h-11 w-11 shrink-0 overflow-hidden rounded-full border ${
    pathname === "/profil"
      ? "border-black bg-black"
      : "border-zinc-700 bg-white"
  }`}
>
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt={userName || "Photo de profil"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div
      className={`flex h-full w-full items-center justify-center text-sm font-black ${
        pathname === "/profil"
          ? "text-white"
          : "text-black"
      }`}
    >
      {userInitials}
    </div>
  )}
</div>

      <div className="min-w-0">
        <p className="truncate font-semibold">
          {userName || "Utilisateur"}
        </p>

        <p
          className={`mt-1 truncate text-xs ${
            pathname === "/profil"
              ? "text-zinc-600"
              : "text-zinc-500"
          }`}
        >
          {userEmail}
        </p>
      </div>
    </div>

    <div
      className={`mt-3 rounded-full border px-3 py-1 text-center text-xs font-semibold ${
        pathname === "/profil"
          ? "border-zinc-300 text-zinc-700"
          : "border-zinc-700 text-zinc-400"
      }`}
    >
      {roleLabel}
    </div>
  </Link>
</div>

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