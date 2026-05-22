"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login" || pathname === "/signup";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <main className="ml-72 min-h-screen">
        {children}
      </main>
    </div>
  );
}