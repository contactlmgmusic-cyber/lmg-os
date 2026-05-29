import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const { data: finances } = await supabase
    .from("finances")
    .select("*")
    .order("date_operation", { ascending: false });

  const revenus =
    finances
      ?.filter((f: any) => f.type === "Revenu")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const depenses =
    finances
      ?.filter((f: any) => f.type === "Dépense")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const resultat = revenus - depenses;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Finances</h1>
          <p className="mt-3 text-zinc-400">
            Pilotage financier LMG.
          </p>
        </div>

        <Link
          href="/finances/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouvelle opération
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
          <p className="text-sm text-green-300">Revenus</p>
          <h2 className="mt-2 text-4xl font-bold">
            {revenus.toFixed(2)} €
          </h2>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">Dépenses</p>
          <h2 className="mt-2 text-4xl font-bold">
            {depenses.toFixed(2)} €
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Résultat</p>
          <h2 className="mt-2 text-4xl font-bold">
            {resultat.toFixed(2)} €
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {finances?.map((finance: any) => (
          <div
            key={finance.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {finance.titre}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {finance.categorie || "Sans catégorie"}
                </p>
              </div>

              <div
                className={
                  finance.type === "Revenu"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {finance.montant} €
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}