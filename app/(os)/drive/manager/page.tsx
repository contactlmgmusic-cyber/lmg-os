import Link from "next/link";
import { Suspense } from "react";
import GoogleDriveConnection from "@/components/GoogleDriveConnection";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DriveSettingsPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-5xl">
    <Link href="/drive" className="text-sm text-zinc-500 hover:text-white">← Retour aux fichiers</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Administration · Stockage</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Connexion Google Drive</h1><p className="mt-3 max-w-2xl text-zinc-500">Configuration centrale réservée aux administrateurs. Les managers utilisent la vue Fichiers, automatiquement limitée à leurs artistes.</p></header>
    <section className="mt-8 rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8"><Suspense fallback={<p className="text-zinc-500">Chargement de la connexion…</p>}><GoogleDriveConnection /></Suspense></section>
  </div></main>;
}
