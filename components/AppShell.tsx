"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LiveNotifications from "./LiveNotifications";
import { useEffect, useState } from "react";
import NotificationsBell from "./NotificationsBell";

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

  const hideSidebar =
    pathname === "/login" || pathname === "/signup";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-72 lg:block">
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

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-black/90 px-5 py-4 backdrop-blur lg:hidden">
        <div>
          <p className="text-lg font-bold text-white">LMG OS</p>
          <p className="text-xs text-zinc-500">Label Management</p>
        </div>

        <div className="flex items-center gap-3">
  <NotificationsBell />

  <button
    type="button"
    onClick={() => setMobileOpen(true)}
    className="rounded-xl bg-white px-4 py-2 font-semibold text-black"
  >
    Menu
  </button>
</div>
      </header>

<div className="fixed right-6 top-5 z-50 hidden lg:block">
  <NotificationsBell />
</div>

      <LiveNotifications />

      <main className="min-h-screen lg:ml-72">
        {children}
      </main>
    </div>
  );
}