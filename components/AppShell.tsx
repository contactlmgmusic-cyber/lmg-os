"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LiveNotifications from "./LiveNotifications";
import { useEffect, useState } from "react";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const hideSidebar = pathname === "/login" || pathname === "/signup";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-76 lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black lg:hidden">
          <Sidebar />

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed right-5 top-5 rounded-xl bg-white px-4 py-2 font-semibold text-black"
          >
            Fermer
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900 bg-black/90 px-5 py-4 backdrop-blur lg:hidden">
        <div>
          <p className="text-lg font-bold text-white">Legacy Music Group</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
            Music OS
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Menu
        </button>
      </header>

      <LiveNotifications />

      <main className="min-h-screen lg:ml-76">{children}</main>
    </div>
  );
}
