import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function SiteInternetPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const [
    { count: publicArtistsCount },
    { count: publicReleasesCount },
    { count: featuredArtistsCount },
    { count: carouselCount },
    { count: candidaturesCount },
  ] = await Promise.all([
    supabase
      .from("artistes")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),

    supabase
      .from("projets")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),

    supabase
      .from("artistes")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)
      .eq("featured", true),

    supabase
      .from("projets")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)
      .eq("show_in_carousel", true),

    supabase
      .from("candidatures")
      .select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-6 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
              Administration
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Site Internet
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Pilote le contenu public de Legacy Music Group directement depuis
              LMG OS.
            </p>
          </div>

          <a
            href="https://legacymusicgroup.fr/site"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
          >
            Voir le site →
          </a>
        </div>

        {/* KPI */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Artistes publics"
            value={publicArtistsCount || 0}
          />

          <StatCard
            label="Releases publiques"
            value={publicReleasesCount || 0}
          />

          <StatCard
            label="Artistes featured"
            value={featuredArtistsCount || 0}
          />

          <StatCard
            label="Carrousel"
            value={carouselCount || 0}
          />

          <StatCard
            label="Candidatures"
            value={candidaturesCount || 0}
          />
        </section>

        {/* PILOTAGE */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
              Pilotage éditorial
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Contenu du site
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ControlCard
              title="Artistes"
              description="Gérer les artistes visibles sur le site, leur mise en avant et leur ordre d’affichage."
              href="/site-internet/artistes"
              status={`${publicArtistsCount || 0} publiés`}
            />

            <ControlCard
              title="Releases"
              description="Gérer les sorties publiques, le carrousel principal et leur ordre d’affichage."
              href="/site-internet/releases"
              status={`${publicReleasesCount || 0} publiées`}
            />

            <ControlCard
              title="Carrousel principal"
              description="Choisir précisément les releases affichées dans le Hero de la homepage."
              href="/site-internet/releases?filter=carousel"
              status={`${carouselCount || 0} actives`}
            />

            <ControlCard
              title="Candidatures"
              description="Consulter les candidatures envoyées depuis le site public."
              href="/candidatures"
              status={`${candidaturesCount || 0} reçues`}
            />
          </div>
        </section>

        {/* LOGIQUE */}
        <section className="mt-12 rounded-[2rem] border border-zinc-900 bg-zinc-950 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Logique de publication
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem
              title="Public"
              code="is_public"
              text="Détermine si le contenu est visible sur le site."
            />

            <InfoItem
              title="Featured"
              code="featured"
              text="Permet de mettre un contenu en avant."
            />

            <InfoItem
              title="Ordre"
              code="display_order"
              text="Détermine la priorité d’affichage."
            />

            <InfoItem
              title="Carrousel"
              code="show_in_carousel"
              text="Ajoute une release au Hero de la homepage."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}

function ControlCard({
  title,
  description,
  href,
  status,
}: {
  title: string;
  description: string;
  href: string;
  status: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-zinc-900 bg-zinc-950 p-7 transition hover:border-yellow-500/50"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black">
            {title}
          </h3>

          <p className="mt-4 max-w-lg leading-7 text-zinc-500">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
          {status}
        </span>
      </div>

      <p className="mt-8 text-sm font-semibold text-zinc-400 transition group-hover:text-yellow-500">
        Gérer →
      </p>
    </Link>
  );
}

function InfoItem({
  title,
  code,
  text,
}: {
  title: string;
  code: string;
  text: string;
}) {
  return (
    <div>
      <h3 className="font-bold">
        {title}
      </h3>

      <code className="mt-2 inline-block rounded-md bg-black px-2 py-1 text-xs text-yellow-500">
        {code}
      </code>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}