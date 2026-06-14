import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ValidationsContratsPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const { data: validations } = await supabase
    .from("contract_approvals")
    .select(`
      *,
      contrats (
        id,
        titre,
        type,
        statut,
        fichier_url,
        fichier_signe_url
      ),
      artistes (
        id,
        nom
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Contract Approvals
        </p>

        <h1 className="text-5xl font-bold">Validations contrats</h1>

        <p className="mt-3 text-zinc-400">
          Suivi des réponses artistes sur les contrats.
        </p>
      </div>

      <section className="space-y-5">
        {(!validations || validations.length === 0) && (
          <p className="text-zinc-500">Aucune validation contrat.</p>
        )}

        {validations?.map((validation: any) => (
          <div
            key={validation.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm text-blue-300">
                  {validation.artistes?.nom || "Artiste"} •{" "}
                  {validation.contrats?.type || "Contrat"}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {validation.contrats?.titre || "Contrat"}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Statut contrat : {validation.contrats?.statut || "Non renseigné"}
                </p>

                {validation.commentaire_artiste && (
                  <p className="mt-4 max-w-3xl text-sm text-yellow-300">
                    Commentaire artiste : {validation.commentaire_artiste}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  {validation.contrats?.fichier_url && (
                    <a
                      href={validation.contrats.fichier_url}
                      target="_blank"
                      className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                    >
                      Contrat original
                    </a>
                  )}

                  {validation.contrats?.fichier_signe_url && (
                    <a
                      href={validation.contrats.fichier_signe_url}
                      target="_blank"
                      className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-300 hover:bg-green-500/20"
                    >
                      Contrat signé
                    </a>
                  )}

                  {validation.contrats?.id && (
                    <Link
                      href={`/contrats/${validation.contrats.id}`}
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      Ouvrir fiche contrat
                    </Link>
                  )}
                </div>
              </div>

              <div className="text-left xl:text-right">
                <span className="inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                  {validation.statut || "En attente"}
                </span>

                {validation.approved_at && (
                  <p className="mt-3 text-xs text-green-300">
                    Approuvé :{" "}
                    {new Date(validation.approved_at).toLocaleString("fr-FR")}
                  </p>
                )}

                {validation.rejected_at && (
                  <p className="mt-3 text-xs text-red-300">
                    Refusé :{" "}
                    {new Date(validation.rejected_at).toLocaleString("fr-FR")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}