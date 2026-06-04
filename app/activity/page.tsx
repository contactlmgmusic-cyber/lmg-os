import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG OS
          </p>

          <h1 className="text-5xl font-bold">Historique d'activité</h1>

          <p className="mt-3 text-zinc-400">
            Toutes les actions importantes du workspace.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
        >
          Retour dashboard
        </Link>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="space-y-4">
          {(!logs || logs.length === 0) && (
            <p className="text-zinc-500">Aucune activité pour le moment.</p>
          )}

          {logs?.map((log: any) => (
            <div
              key={log.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {log.type || "activité"}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {log.titre || "Action enregistrée"}
              </h3>

              {log.description && (
                <p className="mt-2 text-sm text-zinc-400">
                  {log.description}
                </p>
              )}

              <p className="mt-4 text-xs text-zinc-600">
                {new Date(log.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}