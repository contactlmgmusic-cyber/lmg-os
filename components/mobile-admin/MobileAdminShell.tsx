"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileAdminShellProps = {
  children: React.ReactNode;
  userName: string;
  userRole: string;
};

const navigation = [
  { href: "/mobile", label: "Accueil", icon: "home" },
  { href: "/mobile/projets", label: "Projets", icon: "projects" },
  { href: "/mobile/agenda", label: "Agenda", icon: "calendar" },
  { href: "/mobile/equipe", label: "Équipe", icon: "team" },
  { href: "/mobile/alertes", label: "Alertes", icon: "bell" },
] as const;

const roleLabels: Record<string, string> = {
  super_admin: "Direction",
  admin: "Administration",
  manager: "Management",
  artistic_director: "Direction artistique",
};

export default function MobileAdminShell({
  children,
  userName,
  userRole,
}: MobileAdminShellProps) {
  const pathname = usePathname();
  const firstName = userName.trim().split(" ")[0] || "Staff";

  return (
    <div className="min-h-[100svh] bg-[#070707] text-white">
      <div className="mx-auto min-h-[100svh] w-full max-w-[520px] border-x border-white/[0.06] bg-[#090909] shadow-2xl shadow-black">
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090909]/95 px-5 pb-4 pt-[max(18px,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/mobile" className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f2b705] text-sm font-black tracking-[-0.08em] text-black">
                LMG
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.12em]">LMG ADMIN</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {roleLabels[userRole] || "Équipe LMG"}
                </p>
              </div>
            </Link>

            <Link
              href="/mobile/profil"
              aria-label={`Ouvrir le profil de ${firstName}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-black uppercase text-[#f2b705]"
            >
              {firstName.slice(0, 2)}
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100svh-150px)] pb-[calc(102px+env(safe-area-inset-bottom))]">
          {children}
        </main>

        <nav
          aria-label="Navigation principale LMG Admin"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[520px] border-t border-white/[0.08] bg-[#0a0a0a]/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl"
        >
          <div className="grid grid-cols-5">
            {navigation.map((item) => {
              const active =
                item.href === "/mobile"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
                    active ? "text-[#f2b705]" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <NavIcon name={item.icon} active={active} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.2 : 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home") {
    return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>;
  }

  if (name === "projects") {
    return <svg {...common}><path d="M4 5h6l2 2h8v12H4Z" /><path d="M4 9h16" /></svg>;
  }

  if (name === "calendar") {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
  }

  if (name === "team") {
    return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  }

  return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
}
