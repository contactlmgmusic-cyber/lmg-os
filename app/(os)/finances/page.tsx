import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
const cookieStore = await cookies();

const supabaseAuth = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  }
);

const {
  data: { user },
} = await supabaseAuth.auth.getUser();

const { data: currentProfile } = user
  ? await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
  : { data: null };

if (
  currentProfile?.role !== ROLES.SUPER_ADMIN &&
  currentProfile?.role !== ROLES.ADMIN
) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-3xl font-bold text-red-400">
        Accès refusé
      </h1>

      <p className="mt-3 text-zinc-500">
        Vous n'avez pas accès aux finances du label.
      </p>
    </main>
  );
}
  
  const { data: finances } = await supabase
    .from("finances")
    .select(`
      *,
      artistes (
        id,
        nom
      ),
      projets (
        id,
        titre
      ),
      bookings (
        id,
        evenement
      )
    `)
    .order("date_operation", { ascending: false });

    const { data: bookings } = await supabase
  .from("bookings")
  .select("*");

const { data: royalties } = await supabase
  .from("royalties")
  .select("*");

  const revenus =
    finances
      ?.filter((f: any) => f.type === "Revenu")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const depenses =
    finances
      ?.filter((f: any) => f.type === "Dépense")
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const resultat = revenus - depenses;

  const caEncaisse =
  finances
    ?.filter((f: any) => f.type === "Revenu" && f.statut === "Payé")
    .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

const caPrevisionnel =
  finances
    ?.filter((f: any) => f.type === "Revenu" && f.statut !== "Payé")
    .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

const royaltiesAPayer =
  royalties
    ?.filter((r: any) => r.statut !== "Payé")
    .reduce((acc: number, r: any) => acc + Number(r.montant_du || 0), 0) || 0;

const royaltiesPayees =
  royalties
    ?.filter((r: any) => r.statut === "Payé")
    .reduce((acc: number, r: any) => acc + Number(r.montant_du || 0), 0) || 0;

const cachetsConfirmes =
  bookings
    ?.filter((b: any) => b.statut === "Confirmé")
    .reduce(
      (acc: number, b: any) =>
        acc + Number(b.montant_cachet || b.cachet || 0),
      0
    ) || 0;

const cachetsFactures =
  bookings
    ?.filter((b: any) => b.statut === "Facturé")
    .reduce(
      (acc: number, b: any) =>
        acc + Number(b.montant_cachet || b.cachet || 0),
      0
    ) || 0;

const cachetsPayes =
  bookings
    ?.filter((b: any) => b.statut === "Payé")
    .reduce(
      (acc: number, b: any) =>
        acc + Number(b.montant_cachet || b.cachet || 0),
      0
    ) || 0;

const margeNette =
  revenus > 0 ? Math.round((resultat / revenus) * 100) : 0;

  const revenusBooking =
    finances
      ?.filter(
        (f: any) =>
          f.type === "Revenu" &&
          f.categorie?.toLowerCase() === "booking"
      )
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const depensesPromo =
    finances
      ?.filter(
        (f: any) =>
          f.type === "Dépense" &&
          ["promo", "marketing", "ads"].includes(
            f.categorie?.toLowerCase()
          )
      )
      .reduce((acc: number, f: any) => acc + Number(f.montant || 0), 0) || 0;

  const operationsPayees =
    finances?.filter((f: any) => f.statut === "Payé").length || 0;

  const operationsPrevues =
    finances?.filter((f: any) => f.statut === "Prévu").length || 0;

  const byArtist = new Map();

  finances?.forEach((f: any) => {
    if (!f.artistes?.nom) return;

    const current = byArtist.get(f.artistes.nom) || {
      revenus: 0,
      depenses: 0,
    };

    if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
    if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

    byArtist.set(f.artistes.nom, current);
  });

  const artistRanking = Array.from(byArtist.entries())
    .map(([nom, values]: any) => ({
      nom,
      resultat: values.revenus - values.depenses,
      revenus: values.revenus,
      depenses: values.depenses,
    }))
    .sort((a, b) => b.resultat - a.resultat);

  const byProject = new Map();

  finances?.forEach((f: any) => {
    if (!f.projets?.titre) return;

    const current = byProject.get(f.projets.titre) || {
      revenus: 0,
      depenses: 0,
    };

    if (f.type === "Revenu") current.revenus += Number(f.montant || 0);
    if (f.type === "Dépense") current.depenses += Number(f.montant || 0);

    byProject.set(f.projets.titre, current);
  });

  const projectRanking = Array.from(byProject.entries())
    .map(([titre, values]: any) => ({
      titre,
      resultat: values.revenus - values.depenses,
      revenus: values.revenus,
      depenses: values.depenses,
    }))
    .sort((a, b) => b.resultat - a.resultat);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Finance OS
          </p>

          <h1 className="text-5xl font-bold">Finances</h1>

          <p className="mt-3 text-zinc-400">
            Pilotage financier du label : revenus, dépenses, marges et rentabilité.
          </p>
        </div>

        <Link
          href="/finances/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          + Nouvelle opération
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
          <p className="text-sm text-green-300">Revenus</p>
          <h2 className="mt-2 text-4xl font-bold">{revenus.toFixed(2)} €</h2>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">Dépenses</p>
          <h2 className="mt-2 text-4xl font-bold">{depenses.toFixed(2)} €</h2>
        </div>

        <div
          className={`rounded-3xl border p-6 ${
            resultat >= 0
              ? "border-white/20 bg-zinc-900"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <p className="text-sm text-zinc-400">Résultat net</p>
          <h2 className="mt-2 text-4xl font-bold">{resultat.toFixed(2)} €</h2>
        </div>
      </div>

      <section className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
  <div className="mb-6">
    <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
      Cockpit financier
    </p>

    <h2 className="text-3xl font-bold">
      Vision business LMG
    </h2>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <FinanceKpi
      label="CA encaissé"
      value={`${caEncaisse.toFixed(2)} €`}
      tone="green"
    />

    <FinanceKpi
      label="CA prévisionnel"
      value={`${caPrevisionnel.toFixed(2)} €`}
    />

    <FinanceKpi
      label="Marge nette"
      value={`${margeNette}%`}
      tone={margeNette >= 0 ? "green" : "red"}
    />

    <FinanceKpi
      label="Royalties à payer"
      value={`${royaltiesAPayer.toFixed(2)} €`}
      tone="red"
    />

    <FinanceKpi
      label="Royalties payées"
      value={`${royaltiesPayees.toFixed(2)} €`}
      tone="green"
    />

    <FinanceKpi
      label="Cachets confirmés"
      value={`${cachetsConfirmes.toFixed(2)} €`}
    />

    <FinanceKpi
      label="Cachets facturés"
      value={`${cachetsFactures.toFixed(2)} €`}
    />

    <FinanceKpi
      label="Cachets payés"
      value={`${cachetsPayes.toFixed(2)} €`}
      tone="green"
    />
  </div>
</section>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Revenus booking</p>
          <h3 className="mt-2 text-3xl font-bold">{revenusBooking.toFixed(2)} €</h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Dépenses promo</p>
          <h3 className="mt-2 text-3xl font-bold">{depensesPromo.toFixed(2)} €</h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Opérations payées</p>
          <h3 className="mt-2 text-3xl font-bold">{operationsPayees}</h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Opérations prévues</p>
          <h3 className="mt-2 text-3xl font-bold">{operationsPrevues}</h3>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Rentabilité par artiste</h2>

          {artistRanking.length === 0 && (
            <p className="text-zinc-500">Aucune donnée artiste.</p>
          )}

          <div className="space-y-4">
            {artistRanking.slice(0, 6).map((artist) => (
              <div
                key={artist.nom}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{artist.nom}</h3>
                  <p
                    className={
                      artist.resultat >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {artist.resultat.toFixed(2)} €
                  </p>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Revenus : {artist.revenus.toFixed(2)} € • Dépenses :{" "}
                  {artist.depenses.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Rentabilité par projet</h2>

          {projectRanking.length === 0 && (
            <p className="text-zinc-500">Aucune donnée projet.</p>
          )}

          <div className="space-y-4">
            {projectRanking.slice(0, 6).map((project) => (
              <div
                key={project.titre}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{project.titre}</h3>
                  <p
                    className={
                      project.resultat >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {project.resultat.toFixed(2)} €
                  </p>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Revenus : {project.revenus.toFixed(2)} € • Dépenses :{" "}
                  {project.depenses.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Dernières opérations</h2>

        {(!finances || finances.length === 0) && (
          <p className="text-zinc-500">Aucune opération financière.</p>
        )}

        <div className="space-y-4">
         {finances?.map((finance: any) => (
  <Link
    key={finance.id}
    href={`/finances/${finance.id}`}
    className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
  >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{finance.titre}</h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {finance.categorie || "Sans catégorie"} •{" "}
                    {finance.artistes?.nom || "Aucun artiste"} •{" "}
                    {finance.projets?.titre || "Aucun projet"}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={
                      finance.type === "Revenu"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {finance.type === "Revenu" ? "+" : "-"}
                    {Number(finance.montant || 0).toFixed(2)} €
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {finance.statut || "Prévu"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function FinanceKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/30 bg-green-500/10"
      : tone === "red"
      ? "border-red-500/30 bg-red-500/10"
      : "border-zinc-800 bg-black";

  return (
    <div className={`rounded-3xl border p-6 ${toneClass}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <h3 className="mt-3 text-3xl font-bold">{value}</h3>
    </div>
  );
}