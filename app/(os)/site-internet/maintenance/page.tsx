import Link from "next/link";

import SiteMaintenanceManager from "@/components/SiteMaintenanceManager";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function SiteMaintenancePage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-zinc-900 pb-8">
          <Link
            href="/site-internet"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Site Internet
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
            Administration
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
            Maintenance
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Contrôle l’accès au site public LMG Music sans interrompre
            l’accès à LMG OS.
          </p>
        </div>

        <div className="mt-8">
          <SiteMaintenanceManager />
        </div>
      </div>
    </main>
  );
}
