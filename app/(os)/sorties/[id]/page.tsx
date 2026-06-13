import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SortieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: sortie, error } = await supabase
    .from("sorties")
    .select(`
      *,
      artistes ( id, nom ),
      projets (
  id,
  titre,
  budget_clip,
  budget_cover,
  budget_promo,
  budget_studio,
  budget_influence,
  budget_rp
)
    `)
    .eq("id", id)
    .single();

  const links = [
    { label: "Spotify", url: sortie.spotify_url },
    { label: "Apple Music", url: sortie.apple_music_url },
    { label: "Deezer", url: sortie.deezer_url },
    { label: "YouTube", url: sortie.youtube_url },
    { label: "SoundCloud", url: sortie.soundcloud_url },
  ].filter((item) => item.url);

const { data: analytics } = await supabase
  .from("analytics")
  .select("*")
  .eq("sortie_id", id)
  .order("date_snapshot", { ascending: false });

  const budgetSortie =
  Number(sortie?.projets?.budget_clip || 0) +
  Number(sortie?.projets?.budget_cover || 0) +
  Number(sortie?.projets?.budget_promo || 0) +
  Number(sortie?.projets?.budget_studio || 0) +
  Number(sortie?.projets?.budget_influence || 0) +
  Number(sortie?.projets?.budget_rp || 0);

if (error || !sortie) {
  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <p className="text-red-400">Sortie introuvable.</p>
    </main>
  );
}

const totalStreams =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.streams || 0),
    0
  ) || 0;

const totalVues =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.vues || 0),
    0
  ) || 0;

const totalRevenus =
  analytics?.reduce(
    (acc: number, item: any) => acc + Number(item.revenus || 0),
    0
  ) || 0;

  const roi =
  budgetSortie > 0
    ? Math.round(((totalRevenus - budgetSortie) / budgetSortie) * 100)
    : 0;

const dernierSnapshot = analytics?.[0];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/sorties" className="text-sm text-zinc-400 hover:text-white">
        ← Retour aux sorties
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="aspect-square bg-zinc-800">
            {sortie.cover_url ? (
              <img
                src={sortie.cover_url}
                alt={sortie.titre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Aucune cover
              </div>
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {sortie.type || "Single"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{sortie.titre}</h1>

          <p className="mt-3 text-xl text-zinc-400">
            {sortie.artistes?.nom || "Artiste non lié"}
          </p>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {sortie.statut || "En préparation"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info label="Date de sortie" value={sortie.date_sortie} />
            <Info label="UPC" value={sortie.upc} />
            <Info label="ISRC" value={sortie.isrc} />
            <Info label="Projet lié" value={sortie.projets?.titre} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
  <Info
    label="Streams"
    value={totalStreams.toLocaleString("fr-FR")}
  />

  <Info
    label="Vues"
    value={totalVues.toLocaleString("fr-FR")}
  />

  <Info
    label="Revenus"
    value={`${totalRevenus.toFixed(2)} €`}
  />

  <Info
    label="Dernier snapshot"
    value={dernierSnapshot?.date_snapshot || "Aucune donnée"}
  />

  <Info
  label="Budget lié"
  value={`${budgetSortie.toFixed(2)} €`}
/>

<Info
  label="ROI"
  value={
    budgetSortie > 0
      ? `${roi}%`
      : "Budget non renseigné"
  }
/>
</div>

          {links.length > 0 && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
              <h2 className="text-2xl font-bold">Liens DSP</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>
            <p className="mt-4 whitespace-pre-line text-zinc-400">
              {sortie.notes || "Aucune note renseignée."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/sorties/${sortie.id}/modifier`}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
            >
              Modifier sortie
            </Link>

            <Link
              href="/sorties"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-zinc-300 hover:bg-zinc-800"
            >
              Retour
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 break-all text-lg font-semibold">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}