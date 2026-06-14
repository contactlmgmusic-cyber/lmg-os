import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ValidationsArtistePage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const { data: validations } = await supabase
    .from("artist_approvals")
    .select(`
      *,
      artistes (
        id,
        nom
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Artist Approvals
          </p>

          <h1 className="text-5xl font-bold">Validations artiste</h1>
        </div>

        <Link
          href="/validations-artiste/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
        >
          + Nouvelle validation
        </Link>
      </div>

      <section className="space-y-4">
        {(!validations || validations.length === 0) && (
          <p className="text-zinc-500">Aucune validation.</p>
        )}

        {validations?.map((item: any) => (
          <div
            key={item.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  {item.type} • {item.artistes?.nom || "Artiste"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">{item.titre}</h2>

                {item.description && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {item.description}
                  </p>
                )}

                {item.reponse_artiste && (
                  <p className="mt-3 text-sm text-yellow-300">
                    Réponse : {item.reponse_artiste}
                  </p>
                )}
              </div>

              <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                {item.statut}
              </span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}