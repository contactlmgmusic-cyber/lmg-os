import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const statuts = [
  "À contacter",
  "Contacté",
  "Relancé",
  "RDV prévu",
  "Négociation",
  "Signé",
  "Perdu",
];

function formatEuro(value: number) {
  return `${Number(value || 0).toFixed(2)} €`;
}

export default async function ProspectsPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

  const { data: prospects } = await supabase
    .from("prospects_lmg")
    .select(`
      *,
      profiles (
        id,
        nom
      )
    `)
    .order("created_at", { ascending: false });

  const totalPotentiel =
    prospects?.reduce(
      (acc: number, prospect: any) =>
        acc + Number(prospect.potentiel_revenu || 0),
      0
    ) || 0;

  const signes =
    prospects?.filter((prospect: any) => prospect.statut === "Signé") || [];

  const caSigne =
    signes.reduce(
      (acc: number, prospect: any) =>
        acc + Number(prospect.potentiel_revenu || 0),
      0
    ) || 0;

  const relances =
    prospects?.filter((prospect: any) => prospect.prochaine_relance) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Business Pipeline
          </p>

          <h1 className="text-5xl font-bold">Prospects LMG</h1>

          <p className="mt-3 text-zinc-400">
            Marques, salles, festivals, partenaires, labels et opportunités business.
          </p>
        </div>

        <Link
          href="/prospects/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
        >
          + Nouveau prospect
        </Link>
      </div>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Kpi label="Prospects" value={prospects?.length || 0} />
        <Kpi label="Potentiel total" value={formatEuro(totalPotentiel)} />
        <Kpi label="Signés" value={signes.length} />
        <Kpi label="CA signé" value={formatEuro(caSigne)} />
      </section>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Relances à prévoir</h2>
        </div>

        {relances.length === 0 && (
          <p className="text-zinc-500">Aucune relance prévue.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relances.slice(0, 6).map((prospect: any) => (
            <Link
              key={prospect.id}
              href={`/prospects/detail/${prospect.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <p className="text-sm text-yellow-300">
                Relance : {prospect.prochaine_relance}
              </p>

              <h3 className="mt-2 text-xl font-bold">{prospect.nom}</h3>

              <p className="mt-2 text-sm text-zinc-500">
                {prospect.type} • {prospect.ville || "Ville non renseignée"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-7">
        {statuts.map((statut) => {
          const items =
            prospects?.filter((prospect: any) => prospect.statut === statut) ||
            [];

          return (
            <div
              key={statut}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{statut}</h2>

                <span className="rounded-full bg-black px-3 py-1 text-xs text-zinc-400">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((prospect: any) => (
                  <Link
                    key={prospect.id}
                    href={`/prospects/${prospect.id}`}
                    className="block rounded-2xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
                  >
                    <p className="text-xs text-zinc-500">{prospect.type}</p>

                    <h3 className="mt-1 font-bold">{prospect.nom}</h3>

                    <p className="mt-2 text-xs text-zinc-500">
                      {prospect.ville || "Ville non renseignée"}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-green-300">
                      {formatEuro(prospect.potentiel_revenu)}
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Priorité : {prospect.priorite || "Moyenne"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}