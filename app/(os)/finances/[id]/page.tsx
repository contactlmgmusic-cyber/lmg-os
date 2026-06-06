import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function FinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: finance, error } = await supabase
    .from("finances")
    .select(`
      *,
      artistes ( id, nom ),
      projets ( id, titre ),
      bookings ( id, evenement ),
      contrats ( id, titre )
    `)
    .eq("id", id)
    .single();

  if (error || !finance) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Opération financière introuvable.</p>
      </main>
    );
  }

  const isRevenu = finance.type === "Revenu";

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/finances" className="text-sm text-zinc-400 hover:text-white">
        ← Retour finances
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {finance.type || "Opération"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{finance.titre}</h1>

          <p className={isRevenu ? "mt-6 text-5xl font-bold text-green-400" : "mt-6 text-5xl font-bold text-red-400"}>
            {isRevenu ? "+" : "-"}
            {Number(finance.montant || 0).toFixed(2)} €
          </p>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {finance.statut || "Prévu"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Catégorie" value={finance.categorie || "Non renseignée"} />
            <Info label="Date opération" value={finance.date_operation || "Non renseignée"} />
            <Info label="Artiste" value={finance.artistes?.nom || "Non lié"} />
            <Info label="Projet" value={finance.projets?.titre || "Non lié"} />
            <Info label="Booking" value={finance.bookings?.evenement || "Non lié"} />
            <Info label="Contrat" value={finance.contrats?.titre || "Non lié"} />
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              {finance.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              <Link
                href={`/finances/${finance.id}/modifier`}
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
              >
                Modifier opération
              </Link>

              {finance.artistes?.id && (
                <Link
                  href={`/artistes/${finance.artistes.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Voir artiste
                </Link>
              )}

              {finance.projets?.id && (
                <Link
                  href={`/projets/${finance.projets.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Voir projet
                </Link>
              )}

              {finance.bookings?.id && (
                <Link
                  href={`/booking/${finance.bookings.id}`}
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Voir booking
                </Link>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}