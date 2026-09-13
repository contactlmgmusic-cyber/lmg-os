"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getRoleHome, ROLES } from "@/lib/roles";
import { supabaseBrowser } from "@/lib/supabase-browser";
import GlobalSearch from "./GlobalSearch";
import LogoutButton from "./LogoutButton";
import NotificationsBell from "./NotificationsBell";

type SidebarLink = {
  href: string;
  label: string;
  badge?: "notifications" | "chat" | "candidatures";
};

type SidebarSection = {
  title: string;
  eyebrow: string;
  links: SidebarLink[];
};

const executiveSections: SidebarSection[] = [
  {
    title: "Accueil",
    eyebrow: "01",
    links: [
      { href: "/dashboard", label: "Tableau de bord" },
      { href: "/calendrier/global", label: "Calendrier global" },
      { href: "/assistant", label: "Assistant LMG" },
    ],
  },
  {
    title: "Artistes",
    eyebrow: "02",
    links: [
      { href: "/artistes", label: "Tous les artistes" },
      { href: "/artistes/ranking", label: "Performances" },
      { href: "/objectifs-artistes", label: "Objectifs artistes" },
      { href: "/validations-artiste", label: "Validations" },
      { href: "/dashboard/candidatures", label: "Candidatures", badge: "candidatures" },
    ],
  },
  {
    title: "Projets",
    eyebrow: "03",
    links: [
      { href: "/projets", label: "Tous les projets" },
      { href: "/projets-internes", label: "Projets internes" },
      { href: "/sorties", label: "Catalogue des sorties" },
      { href: "/release-planner", label: "Planning des sorties" },
      { href: "/rollout", label: "Rollouts" },
      { href: "/taches", label: "Tâches" },
      { href: "/drive", label: "Fichiers & Drive" },
    ],
  },
  {
    title: "Développement",
    eyebrow: "04",
    links: [
      { href: "/booking", label: "Booking" },
      { href: "/campagnes", label: "Campagnes" },
      { href: "/medias", label: "Relations médias" },
      { href: "/influenceurs", label: "Influenceurs" },
      { href: "/partenaires", label: "Partenaires" },
      { href: "/prospects", label: "Prospects" },
    ],
  },
  {
    title: "Finance & juridique",
    eyebrow: "05",
    links: [
      { href: "/finances/dashboard", label: "Vue financière" },
      { href: "/finances", label: "Transactions" },
      { href: "/royalties", label: "Royalties" },
      { href: "/contrats", label: "Contrats" },
      { href: "/splits", label: "Split sheets" },
    ],
  },
  {
    title: "Communication",
    eyebrow: "06",
    links: [
      { href: "/communication", label: "Centre de communication" },
      { href: "/chat", label: "Chat d’équipe", badge: "chat" },
      { href: "/chat/prive", label: "Messages privés", badge: "chat" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
  {
    title: "Administration",
    eyebrow: "07",
    links: [
      { href: "/equipe", label: "Équipe" },
      { href: "/invitations", label: "Invitations" },
      { href: "/site-internet", label: "Site Internet" },
      { href: "/admin", label: "Paramètres" },
    ],
  },
];

const artisticDirectorSections: SidebarSection[] = [
  {
    title: "Accueil",
    eyebrow: "01",
    links: [
      { href: "/dashboard", label: "Tableau de bord" },
      { href: "/calendrier/global", label: "Calendrier global" },
    ],
  },
  {
    title: "Artistes",
    eyebrow: "02",
    links: [
      { href: "/artistes", label: "Tous les artistes" },
      { href: "/artistes/ranking", label: "Performances" },
      { href: "/objectifs-artistes", label: "Objectifs artistes" },
      { href: "/validations-artiste", label: "Validations" },
    ],
  },
  {
    title: "Projets",
    eyebrow: "03",
    links: [
      { href: "/projets", label: "Tous les projets" },
      { href: "/projets-internes", label: "Projets internes" },
      { href: "/sorties", label: "Catalogue des sorties" },
      { href: "/release-planner", label: "Planning des sorties" },
      { href: "/rollout", label: "Rollouts" },
      { href: "/taches", label: "Tâches de l’équipe" },
      { href: "/mes-taches", label: "Mes tâches" },
      { href: "/drive", label: "Fichiers & Drive" },
    ],
  },
  {
    title: "Développement",
    eyebrow: "04",
    links: [
      { href: "/campagnes", label: "Campagnes" },
      { href: "/medias", label: "Relations médias" },
      { href: "/influenceurs", label: "Influenceurs" },
      { href: "/partenaires", label: "Partenaires" },
    ],
  },
  {
    title: "Communication",
    eyebrow: "05",
    links: [
      { href: "/chat", label: "Chat d’équipe", badge: "chat" },
      { href: "/chat/prive", label: "Messages privés", badge: "chat" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
];

const managerSections: SidebarSection[] = [
  {
    title: "Accueil",
    eyebrow: "01",
    links: [
      { href: "/manager", label: "Tableau de bord" },
      { href: "/manager/kpi", label: "Mes indicateurs" },
      { href: "/calendrier", label: "Mon calendrier" },
    ],
  },
  {
    title: "Mes artistes",
    eyebrow: "02",
    links: [
      { href: "/artistes", label: "Portefeuille artistes" },
      { href: "/artistes/ranking", label: "Performances" },
      { href: "/objectifs-artistes", label: "Objectifs" },
    ],
  },
  {
    title: "Production",
    eyebrow: "03",
    links: [
      { href: "/projets", label: "Projets" },
      { href: "/projets-internes", label: "Projets internes" },
      { href: "/sorties", label: "Sorties" },
      { href: "/release-planner", label: "Planning" },
      { href: "/rollout", label: "Rollouts" },
      { href: "/taches", label: "Tâches" },
      { href: "/drive/manager", label: "Fichiers" },
    ],
  },
  {
    title: "Développement",
    eyebrow: "04",
    links: [
      { href: "/booking", label: "Booking" },
      { href: "/campagnes", label: "Campagnes" },
      { href: "/medias", label: "Relations médias" },
      { href: "/influenceurs", label: "Influenceurs" },
    ],
  },
  {
    title: "Finance & contrats",
    eyebrow: "05",
    links: [
      { href: "/royalties", label: "Royalties" },
      { href: "/contrats", label: "Contrats" },
    ],
  },
  {
    title: "Communication",
    eyebrow: "06",
    links: [
      { href: "/chat", label: "Chat d’équipe", badge: "chat" },
      { href: "/chat/prive", label: "Messages privés", badge: "chat" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
];

const artisteSections: SidebarSection[] = [
  {
    title: "Mon espace",
    eyebrow: "01",
    links: [
      { href: "/mon-espace-artiste", label: "Vue d’ensemble" },
      { href: "/mon-espace-artiste/calendrier", label: "Mon calendrier" },
      { href: "/mon-espace-artiste/evenements", label: "Mes événements" },
      { href: "/mon-espace-artiste/documents", label: "Mes documents" },
    ],
  },
  {
    title: "À traiter",
    eyebrow: "02",
    links: [
      { href: "/mon-espace-artiste/validations", label: "Mes validations" },
      { href: "/mon-espace-artiste/contrats", label: "Mes contrats" },
    ],
  },
  {
    title: "Communication",
    eyebrow: "03",
    links: [
      { href: "/chat", label: "Chat d’équipe", badge: "chat" },
      { href: "/chat/prive", label: "Messages privés", badge: "chat" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
];

const prestataireSections: SidebarSection[] = [
  {
    title: "Mon travail",
    eyebrow: "01",
    links: [
      { href: "/mes-taches", label: "Mes tâches" },
      { href: "/calendrier", label: "Mon calendrier" },
      { href: "/drive", label: "Mes fichiers" },
    ],
  },
  {
    title: "Communication",
    eyebrow: "02",
    links: [
      { href: "/chat", label: "Chat d’équipe", badge: "chat" },
      { href: "/chat/prive", label: "Messages privés", badge: "chat" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Administrateur",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ARTISTIC_DIRECTOR]: "Direction artistique",
  [ROLES.ARTISTE]: "Artiste",
  [ROLES.PRESTATAIRE]: "Prestataire",
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
  const [openSections, setOpenSections] = useState<string[]>(["Accueil"]);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabaseBrowser.channel> | null = null;

    async function fetchUserData() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user || !active) return;

      setUserEmail(user.email || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role, nom")
        .eq("id", user.id)
        .single();

      if (!active) return;
      setRole(profile?.role || null);
      setUserName(
        profile?.nom || user.user_metadata?.full_name ||
        user.user_metadata?.name || user.email?.split("@")[0] || "Utilisateur"
      );

      async function loadCounts(userId: string) {
        const [{ count: notifications }, { count: chat }, { count: candidatures }] =
          await Promise.all([
            supabaseBrowser.from("notifications").select("*", { count: "exact", head: true })
              .eq("user_id", userId).or("lu.eq.false,is_read.eq.false"),
            supabaseBrowser.from("notifications").select("*", { count: "exact", head: true })
              .eq("user_id", userId).eq("type", "Chat").or("lu.eq.false,is_read.eq.false"),
            supabaseBrowser.from("candidatures").select("*", { count: "exact", head: true })
              .eq("statut", "Nouvelle"),
          ]);

        if (!active) return;
        setUnreadNotifications(notifications || 0);
        setUnreadChatNotifications(chat || 0);
        setNewCandidatures(candidatures || 0);
      }

      await loadCounts(user.id);
      channel = supabaseBrowser.channel("sidebar-notifications-count")
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
          () => loadCounts(user.id))
        .subscribe();
    }

    fetchUserData();
    return () => {
      active = false;
      if (channel) supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const sections = useMemo(() => {
    if (!role) return [];
    if (role === ROLES.ARTISTE) return artisteSections;
    if (role === ROLES.MANAGER) return managerSections;
    if (role === ROLES.ARTISTIC_DIRECTOR) return artisticDirectorSections;
    if (role === ROLES.PRESTATAIRE) return prestataireSections;
    return executiveSections;
  }, [role]);

  useEffect(() => {
    const activeSection = sections.find((section) =>
      section.links.some((link) => isActiveLink(pathname, link.href))
    );
    if (activeSection) {
      setOpenSections((current) => current.includes(activeSection.title)
        ? current : [...current, activeSection.title]);
    }
  }, [pathname, sections]);

  const canUseGlobalTools = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.MANAGER;
  const homeHref = getRoleHome(role);
  const roleLabel = role ? roleLabels[role] || role : "Chargement...";
  const userInitials = userName.split(" ").filter(Boolean).map((part) => part[0])
    .join("").slice(0, 2).toUpperCase() || "LM";

  function toggleSection(title: string) {
    setOpenSections((current) => current.includes(title)
      ? current.filter((item) => item !== title) : [...current, title]);
  }

  function badgeCount(badge: SidebarLink["badge"]) {
    if (badge === "notifications") return unreadNotifications;
    if (badge === "chat") return unreadChatNotifications;
    if (badge === "candidatures") return newCandidatures;
    return 0;
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-900 bg-black text-white">
      <div className="shrink-0 border-b border-zinc-900 px-5 pb-5 pt-6">
        <Link href={homeHref} className="flex items-center gap-3">
          <Image src="/logo-lmg.png" alt="Legacy Music Group" width={52} height={52} priority />
          <div className="min-w-0">
            <p className="truncate text-base font-bold">Legacy Music Group</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">Music OS</p>
          </div>
        </Link>
        {canUseGlobalTools && <div className="mt-5"><GlobalSearch /></div>}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {!role && (
            <div className="space-y-3 px-3 py-2" aria-label="Chargement de la navigation">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-11 animate-pulse rounded-xl bg-zinc-950" />
              ))}
            </div>
          )}
          {sections.map((section) => {
            const isOpen = openSections.includes(section.title);
            const sectionIsActive = section.links.some((link) => isActiveLink(pathname, link.href));
            return (
              <section key={section.title}>
                <button type="button" onClick={() => toggleSection(section.title)} aria-expanded={isOpen}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${sectionIsActive || isOpen ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-950 hover:text-zinc-200"}`}>
                  <span className="w-6 text-[10px] font-bold tracking-wider text-zinc-600">{section.eyebrow}</span>
                  <span className="flex-1 text-sm font-semibold">{section.title}</span>
                  <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-zinc-900 pl-3">
                    {section.links.map((link) => {
                      const active = isActiveLink(pathname, link.href);
                      const count = badgeCount(link.badge);
                      return (
                        <Link key={link.href} href={link.href}
                          className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white font-semibold text-black" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-yellow-500" : "bg-zinc-700 group-hover:bg-zinc-500"}`} />
                          <span className="min-w-0 flex-1 truncate">{link.label}</span>
                          {count > 0 && (
                            <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${active ? "bg-black text-white" : link.badge === "candidatures" ? "bg-yellow-500 text-black" : "bg-red-500 text-white"}`}>
                              {count > 99 ? "99+" : count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-zinc-900 bg-black p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/profil" className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition ${pathname === "/profil" ? "bg-zinc-900" : "hover:bg-zinc-950"}`}>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-800 bg-white">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName || "Photo de profil"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-black text-black">{userInitials}</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName || "Utilisateur"}</p>
              <p className="truncate text-[11px] text-zinc-500">{roleLabel}</p>
            </div>
          </Link>
          {canUseGlobalTools && <NotificationsBell />}
        </div>
        <p className="mb-3 truncate px-2 text-[11px] text-zinc-600">{userEmail}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}

function isActiveLink(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/manager" || href === "/chat") return pathname === href;
  if (href === "/artistes") return pathname === href || /^\/artistes\/[^/]+/.test(pathname);
  if (href === "/projets") return pathname === href || /^\/projets\/[^/]+/.test(pathname);
  if (href === "/projets-internes") return pathname === href || pathname.startsWith("/projets-internes/");
  return pathname === href || pathname.startsWith(`${href}/`);
}
