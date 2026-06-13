import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ReleasePlannerPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const { data: sorties } = await supabase
    .from("sorties")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre )
    `)
    .order("date_sortie", { ascending: true });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Release Planner
        </p>

        <h1 className="text-5xl font-bold">Release Planner</h1>

        <p className="mt-3 text-zinc-400">
          Planifie les actions clés avant et après chaque sortie.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sorties?.map((sortie: any) => (
          <Link
            key={sortie.id}
            href={`/release-planner/${sortie.id}`}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-500">
              {sortie.artistes?.nom || "Artiste non lié"}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {sortie.titre}
            </h2>

            <p className="mt-2 text-zinc-400">
              {sortie.type || "Sortie"} • {sortie.statut || "Statut"}
            </p>

            <p className="mt-5 text-sm text-zinc-500">
              Date : {sortie.date_sortie || "Non renseignée"}
            </p>
          </Link>
        ))}

        {(!sorties || sorties.length === 0) && (
          <p className="text-zinc-500">Aucune sortie disponible.</p>
        )}
      </section>
    </main>
  );
}