import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isToday(date?: string | null) {
  if (!date) return false;

  const today = new Date();
  const target = new Date(date);

  return today.toDateString() === target.toDateString();
}

export default async function MediasDashboardPage() {
  const { data: medias } = await supabase
    .from("medias")
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
    .order("created_at", { ascending: false });

  const allMedias = medias || [];

  const total = allMedias.length;
  const aContacter = allMedias.filter((m: any) => !m.statut || m.statut === "À contacter").length;
  const contactes = allMedias.filter((m: any) => m.statut === "Contacté").length;
  const relances = allMedias.filter((m: any) => m.statut === "Relancé").length;
  const interesses = allMedias.filter((m: any) => m.statut === "Intéressé").length;
  const publies = allMedias.filter((m: any) => m.statut === "Publié").length;
  const refuses = allMedias.filter((m: any) => m.statut === "Refusé").length;

  const relancesAujourdhui = allMedias.filter((m: any) =>
    isToday(m.prochaine_relance)
  );

  const mediasContactes = allMedias.filter((m: any) =>
    ["Contacté", "Relancé", "Intéressé", "Publié", "Refusé"].includes(m.statut)
  ).length;

  const tauxConversion =
    mediasContactes > 0 ? Math.round((publies / mediasContactes) * 100) : 0;

  const topAudience = [...allMedias]
    .filter((m: any) => m.audience)
    .sort((a: any, b: any) => Number(b.audience || 0) - Number(a.audience || 0))
    .slice(0, 5);

  const hautePriorite = allMedias
    .filter((m: any) => m.priorite === "Haute" || m.priorite === "Critique")
    .slice(0, 5);

  const kpis = [
    { label: "Total médias", value: total, className: "border-zinc-700 bg-zinc-900 text-zinc-300" },
    { label: "À contacter", value: aContacter, className: "border-zinc-700 bg-zinc-950 text-zinc-300" },
    { label: "Contactés", value: contactes, className: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
    { label: "Relancés", value: relances, className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" },
    { label: "Intéressés", value: interesses, className: "border-green-500/30 bg-green-500/10 text-green-300" },
    { label: "Publiés", value: publies, className: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
    { label: "Refusés", value: refuses, className: "border-red-500/30 bg-red-500/10 text-red-300" },
    { label: "Conversion", value: `${tauxConversion}%`, className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
  ];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between gap-6">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG CRM
          </p>

          <h1 className="text-5xl font-bold">Dashboard Médias</h1>

          <p className="mt-3 text-zinc-400">
            Vue globale du pipeline médias, relances et opportunités promo.
          </p>
        </div>

        <Link
          href="/medias"
          className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
        >
          Retour pipeline
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-3xl border p-5 ${kpi.className}`}
          >
            <p className="text-sm opacity-80">{kpi.label}</p>
            <p className="mt-4 text-3xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Relances aujourd'hui</h2>

          <div className="space-y-4">
            {relancesAujourdhui.length === 0 && (
              <p className="text-zinc-500">Aucune relance prévue aujourd'hui.</p>
            )}

            {relancesAujourdhui.map((media: any) => (
              <Link
                key={media.id}
                href={`/medias/${media.id}`}
                className="block rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 hover:border-yellow-400"
              >
                <h3 className="text-xl font-semibold">{media.nom}</h3>
                <p className="mt-1 text-sm text-yellow-200/70">
                  {media.contact_nom || "Contact non renseigné"}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {media.projets?.titre || media.artistes?.nom || "Aucun lien"}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Top audiences</h2>

          <div className="space-y-4">
            {topAudience.length === 0 && (
              <p className="text-zinc-500">Aucune audience renseignée.</p>
            )}

            {topAudience.map((media: any) => (
              <Link
                key={media.id}
                href={`/medias/${media.id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{media.nom}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {media.type || "Média"} · {media.plateforme || "-"}
                    </p>
                  </div>

                  <p className="font-bold text-cyan-300">
                    {Number(media.audience || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Priorités fortes</h2>

          <div className="space-y-4">
            {hautePriorite.length === 0 && (
              <p className="text-zinc-500">Aucune priorité haute.</p>
            )}

            {hautePriorite.map((media: any) => (
              <Link
                key={media.id}
                href={`/medias/${media.id}`}
                className="block rounded-2xl border border-red-500/30 bg-red-500/10 p-5 hover:border-red-400"
              >
                <h3 className="text-xl font-semibold">{media.nom}</h3>
                <p className="mt-1 text-sm text-red-200/70">
                  Priorité : {media.priorite}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {media.projets?.titre || media.artistes?.nom || "Aucun lien"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}