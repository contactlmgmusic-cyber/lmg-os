import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteContractButton from "@/components/DeleteContractButton";

export const dynamic = "force-dynamic";

export default async function ContratDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: contrat, error } = await supabase
    .from("contrats")
    .select(`
      *,
      artistes (
        id,
        nom
      ),
      projets (
        id,
        titre
      )
    `)
    .eq("id", id)
    .single();

  if (error || !contrat) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Contrat introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/contrats" className="text-sm text-zinc-400 hover:text-white">
        ← Retour aux contrats
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {contrat.type}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{contrat.titre}</h1>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {contrat.statut || "Brouillon"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Artiste lié</p>
              <p className="mt-2 text-xl font-semibold">
                {contrat.artistes?.nom || "Non lié"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Projet lié</p>
              <p className="mt-2 text-xl font-semibold">
                {contrat.projets?.titre || "Non lié"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes internes</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              {contrat.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-3xl font-bold">Actions</h2>

          {contrat.fichier_url && (
            <a
              href={contrat.fichier_url}
              target="_blank"
              className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
            >
              Ouvrir PDF
            </a>
          )}

          <Link
            href={`/contrats/${contrat.id}/modifier`}
            className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
          >
            Modifier contrat
          </Link>

          <DeleteContractButton contratId={contrat.id} />

          <Link
            href={`/contrats/${contrat.id}/signer`}
            className="block rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-4 text-center text-green-300 hover:bg-green-500/20"
          >
            Signer contrat
          </Link>
        </aside>
      </div>
    </main>
  );
}