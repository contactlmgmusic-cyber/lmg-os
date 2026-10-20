import Link from "next/link";

import CareersJobForm from "@/components/careers-admin/CareersJobForm";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export default async function NewCareersJobPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return (
    <main className="space-y-6 pb-10">
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white sm:p-8">
        <Link
          href="/recrutement/offres"
          className="text-sm text-zinc-400 transition hover:text-amber-400"
        >
          ← Retour aux offres
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          LMG Careers
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Nouvelle offre
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Créez une nouvelle opportunité et choisissez de la conserver
          en brouillon ou de la publier immédiatement.
        </p>
      </div>

      <CareersJobForm />
    </main>
  );
}
