import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
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

  const { data: artistes } = await supabase
    .from("artistes")
    .select("*")
    .eq("manager_id", user?.id);

  const artisteIds = artistes?.map((a: any) => a.id) || [];

  const { data: projets } =
    artisteIds.length > 0
      ? await supabase.from("projets").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const { data: bookings } =
    artisteIds.length > 0
      ? await supabase.from("bookings").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const { data: contrats } =
    artisteIds.length > 0
      ? await supabase.from("contrats").select("*").in("artiste_id", artisteIds)
      : { data: [] };

  const { data: medias } =
    artisteIds.length > 0
      ? await supabase.from("medias").select("*").in("artiste_id", artisteIds)
      : { data: [] };

const { data: finances } =
  artisteIds.length > 0
    ? await supabase.from("finances").select("*").in("artiste_id", artisteIds)
    : { data: [] };

const projetIds = projets?.map((p: any) => p.id) || [];

const { data: royalties } =
  projetIds.length > 0
    ? await supabase.from("royalties").select("*").in("projet_id", projetIds)
    : { data: [] };

const { data: taches } =
  projetIds.length > 0
    ? await supabase.from("taches").select("*").in("projet_id", projetIds)
    : { data: [] };

  const projetsActifs =
    projets?.filter((p: any) => p.statut !== "Sorti").length || 0;

  const bookingsNegociation =
    bookings?.filter((b: any) => b.statut === "En négociation").length || 0;

  const bookingsConfirmes =
    bookings?.filter((b: any) => b.statut === "Confirmé").length || 0;

  const contratsASigner =
    contrats?.filter((c: any) => c.statut !== "Signé").length || 0;

  const mediasRelance =
    medias?.filter((m: any) => m.statut === "Relancé").length || 0;

  const mediasAContacter =
    medias?.filter((m: any) => !m.statut || m.statut === "À contacter").length || 0;

const chiffreAffaires =
  finances
    ?.filter((f: any) => f.type === "Revenu")
    .reduce(
      (acc: number, f: any) => acc + Number(f.montant || 0),
      0
    ) || 0;

const royaltiesAPayer =
  royalties
    ?.filter((r: any) => r.statut !== "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

const royaltiesPayees =
  royalties
    ?.filter((r: any) => r.statut === "Payé")
    .reduce(
      (acc: number, r: any) => acc + Number(r.montant_du || 0),
      0
    ) || 0;

const tachesOuvertes =
  taches?.filter((t: any) => t.statut !== "Terminé").length || 0;

  const today = new Date();

const sortiesAVenir =
  projets
    ?.filter(
      (p: any) =>
        p.date_sortie &&
        new Date(p.date_sortie) >= today
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.date_sortie).getTime() -
        new Date(b.date_sortie).getTime()
    )
    .slice(0, 5) || [];

const tachesEnRetard =
  taches
    ?.filter(
      (t: any) =>
        t.deadline &&
        new Date(t.deadline) < today &&
        t.statut !== "Terminé"
    )
    .sort(
      (a: any, b: any) =>
        new Date(a.deadline).getTime() -
        new Date(b.deadline).getTime()
    )
    .slice(0, 5) || [];

const bookingsEnNegociation =
  bookings
    ?.filter(
      (b: any) =>
        b.statut === "Négociation" ||
        b.statut === "En négociation"
    )
    .slice(0, 5) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Manager
        </p>

        <h1 className="text-5xl font-bold">Dashboard Manager</h1>

        <p className="mt-3 text-zinc-400">
          Vue opérationnelle de tes artistes, projets, bookings et campagnes promo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card label="Mes artistes" value={artistes?.length || 0} />
<Card label="Projets actifs" value={projetsActifs} />
<Card label="CA généré (€)" value={Math.round(chiffreAffaires)} />
<Card label="Royalties à payer (€)" value={Math.round(royaltiesAPayer)} />
<Card label="Bookings confirmés" value={bookingsConfirmes} />
<Card label="Tâches ouvertes" value={tachesOuvertes} />
<Card label="Contrats à signer" value={contratsASigner} />
<Card label="Royalties payées (€)" value={Math.round(royaltiesPayees)} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Mes artistes" href="/artistes">
          {(!artistes || artistes.length === 0) && (
            <p className="text-zinc-500">Aucun artiste assigné.</p>
          )}

          {artistes?.map((artiste: any) => (
            <Link
              key={artiste.id}
              href={`/artistes/${artiste.id}`}
              className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
            >
              <h3 className="text-xl font-semibold">{artiste.nom}</h3>
              <p className="mt-2 text-sm text-zinc-500">
                {artiste.style || "Style non renseigné"} • {artiste.statut || "Statut"}
              </p>
            </Link>
          ))}
        </Panel>

        <Panel title="Bookings à suivre" href="/booking">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MiniStat label="En négociation" value={bookingsNegociation} />
            <MiniStat label="Confirmés" value={bookingsConfirmes} />
          </div>
        </Panel>

        <Panel title="Promo / Médias" href="/medias">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MiniStat label="À contacter" value={mediasAContacter} />
            <MiniStat label="Relancés" value={mediasRelance} />
          </div>
        </Panel>

        <Panel title="Projets actifs" href="/projets">
          {(!projets || projets.length === 0) && (
            <p className="text-zinc-500">Aucun projet actif.</p>
          )}

          {projets
            ?.filter((p: any) => p.statut !== "Sorti")
            .slice(0, 6)
            .map((projet: any) => (
              <Link
                key={projet.id}
                href={`/projets/${projet.id}`}
                className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <h3 className="text-xl font-semibold">{projet.titre}</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {projet.type || "Projet"} • {projet.date_sortie || "Date non définie"}
                </p>
              </Link>
            ))}
        </Panel>

        <Panel title="Sorties à venir" href="/projets">
  {sortiesAVenir.length === 0 && (
    <p className="text-zinc-500">
      Aucune sortie à venir.
    </p>
  )}

  {sortiesAVenir.map((projet: any) => (
    <Link
      key={projet.id}
      href={`/projets/${projet.id}`}
      className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
    >
      <h3 className="text-xl font-semibold">
        {projet.titre}
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        Sortie : {projet.date_sortie}
      </p>
    </Link>
  ))}
</Panel>

<Panel title="Tâches en retard" href="/taches">
  {tachesEnRetard.length === 0 && (
    <p className="text-zinc-500">
      Aucune tâche en retard.
    </p>
  )}

  {tachesEnRetard.map((tache: any) => (
    <Link
      key={tache.id}
      href={`/taches/${tache.id}`}
      className="block rounded-2xl border border-red-500/30 bg-red-500/5 p-5 hover:border-red-500/60"
    >
      <h3 className="text-xl font-semibold">
        {tache.titre}
      </h3>

      <p className="mt-2 text-sm text-red-300">
        Deadline dépassée : {tache.deadline}
      </p>
    </Link>
  ))}
</Panel>

<Panel title="Bookings en négociation" href="/booking">
  {bookingsEnNegociation.length === 0 && (
    <p className="text-zinc-500">
      Aucun booking en négociation.
    </p>
  )}

  {bookingsEnNegociation.map((booking: any) => (
    <Link
      key={booking.id}
      href={`/booking/${booking.id}`}
      className="block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
    >
      <h3 className="text-xl font-semibold">
        {booking.evenement}
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        {booking.ville || "Ville non renseignée"} •{" "}
        {booking.date_event || "Date non renseignée"}
      </p>
    </Link>
  ))}
</Panel>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <h2 className="mt-3 text-5xl font-bold">{value}</h2>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold">{value}</h3>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{title}</h2>

        <Link href={href} className="text-sm text-zinc-400 hover:text-white">
          Voir →
        </Link>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}