import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function RoyaltiesPage() {
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
        .select("role, artiste_id, email")
        .eq("id", user.id)
        .single()
    : { data: null };

  let query = supabase
    .from("royalties")
    .select(`
      *,
      projets (
        id,
        titre,
        artiste_id,
        artistes (
          id,
          nom,
          manager_id
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "manager") {
    query = query.eq("projets.artistes.manager_id", user?.id);
  }

  if (currentProfile?.role === "artiste" && currentProfile?.email) {
    query = query.eq("email", currentProfile.email);
  }

  if (currentProfile?.role === "prestataire") {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: royalties, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  const canGenerateRoyalties =
    currentProfile?.role === "super_admin" ||
    currentProfile?.role === "admin";

  const totalDu =
    royalties?.reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

  const totalPaye =
    royalties
      ?.filter((r: any) => r.statut === "Payé")
      .reduce((acc: number, r: any) => acc + Number(r.montant_du || 0), 0) ||
    0;

  const totalAPayer =
    royalties
      ?.filter((r: any) => r.statut !== "Payé")
      .reduce((acc: number, r: any) => acc + Number(r.montant_du || 0), 0) ||
    0;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Royalties
          </p>

          <h1 className="text-5xl font-bold">
            {currentProfile?.role === "artiste" ? "Mes royalties" : "Royalties"}
          </h1>

          <p className="mt-3 text-zinc-400">
            {currentProfile?.role === "manager"
              ? "Royalties liées à mes artistes."
              : currentProfile?.role === "artiste"
              ? "Suivi de tes montants dus et payés."
              : "Répartition automatique des revenus issus des masters."}
          </p>
        </div>

        {canGenerateRoyalties && (
          <Link
            href="/royalties/generer"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            Générer royalties
          </Link>
        )}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">Total royalties</p>
          <h2 className="mt-2 text-4xl font-bold">{totalDu.toFixed(2)} €</h2>
        </div>

        <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
          <p className="text-sm text-green-300">Déjà payé</p>
          <h2 className="mt-2 text-4xl font-bold">{totalPaye.toFixed(2)} €</h2>
        </div>

        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">À payer</p>
          <h2 className="mt-2 text-4xl font-bold">
            {totalAPayer.toFixed(2)} €
          </h2>
        </div>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="mb-6 text-3xl font-bold">Répartition détaillée</h2>

        {(!royalties || royalties.length === 0) && (
          <p className="text-zinc-500">Aucune royalty générée.</p>
        )}

        <div className="space-y-4">
          {royalties?.map((royalty: any) => (
            <div
              key={royalty.id}
              className="rounded-2xl border border-zinc-800 bg-black p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{royalty.nom}</h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {royalty.role || "Participant"} •{" "}
                    {royalty.projets?.titre || "Projet"}
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    {royalty.pourcentage}% de{" "}
                    {Number(royalty.revenu_total || 0).toFixed(2)} €
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    {Number(royalty.montant_du || 0).toFixed(2)} €
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${
                      royalty.statut === "Payé"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {royalty.statut || "À payer"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}