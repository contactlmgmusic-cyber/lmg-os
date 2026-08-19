"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase-browser";

type ArtistRelation = {
  nom: string | null;
};

type Release = {
  id: string;
  titre: string | null;
  slug: string | null;
  type: string | null;
  date_sortie: string | null;
  cover_url: string | null;
  hero_image_url: string | null;

  is_public: boolean | null;
  featured: boolean | null;
  show_in_carousel: boolean | null;
  display_order: number | null;

  artistes: ArtistRelation | ArtistRelation[] | null;
};

function getArtist(
  artistes: ArtistRelation | ArtistRelation[] | null
) {
  if (Array.isArray(artistes)) {
    return artistes[0] || null;
  }

  return artistes;
}

export default function SiteReleasesManager() {
  const searchParams = useSearchParams();

  const carouselOnly =
    searchParams.get("filter") === "carousel";

  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingId, setSavingId] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState("");

  async function loadReleases() {
    setLoading(true);

    const { data, error } = await supabaseBrowser
      .from("projets")
      .select(`
        id,
        titre,
        slug,
        type,
        date_sortie,
        cover_url,
        hero_image_url,
        is_public,
        featured,
        show_in_carousel,
        display_order,
        artistes (
          nom
        )
      `)
      .order("display_order", {
        ascending: true,
      })
      .order("date_sortie", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setReleases((data || []) as Release[]);
    setLoading(false);
  }

  useEffect(() => {
    loadReleases();
  }, []);

  const visibleReleases = useMemo(() => {
    if (!carouselOnly) {
      return releases;
    }

    return releases.filter(
      (release) => release.show_in_carousel
    );
  }, [releases, carouselOnly]);

  async function updateRelease(
    id: string,
    patch: Partial<Release>
  ) {
    setSavingId(id);
    setMessage("");

    const { error } = await supabaseBrowser
      .from("projets")
      .update(patch)
      .eq("id", id);

    if (error) {
      alert(error.message);
      setSavingId(null);
      return false;
    }

    setReleases((current) =>
      current.map((release) =>
        release.id === id
          ? {
              ...release,
              ...patch,
            }
          : release
      )
    );

    setSavingId(null);
    setMessage("Modification enregistrée.");

    window.setTimeout(() => {
      setMessage("");
    }, 2000);

    return true;
  }

  async function togglePublic(release: Release) {
    const nextValue = !release.is_public;

    const patch: Partial<Release> = {
      is_public: nextValue,
    };

    // Si on retire une release du site,
    // elle ne doit plus rester dans le carousel.
    if (!nextValue) {
      patch.show_in_carousel = false;
    }

    await updateRelease(release.id, patch);
  }

  async function toggleFeatured(release: Release) {
    await updateRelease(release.id, {
      featured: !release.featured,
    });
  }

  async function toggleCarousel(release: Release) {
    const nextValue = !release.show_in_carousel;

    // Une release présente dans le Hero
    // doit forcément être publique.
    await updateRelease(release.id, {
      show_in_carousel: nextValue,
      ...(nextValue
        ? {
            is_public: true,
          }
        : {}),
    });
  }

  async function updateOrder(
    release: Release,
    value: number
  ) {
    await updateRelease(release.id, {
      display_order: value,
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-400">
          Chargement des releases...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-6 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/site-internet"
              className="text-sm text-zinc-500 transition hover:text-white"
            >
              ← Site Internet
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
              Pilotage éditorial
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              {carouselOnly
                ? "Carrousel principal"
                : "Releases"}
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              {carouselOnly
                ? "Gère les sorties actuellement présentes dans le Hero de la homepage."
                : "Choisis les releases visibles sur le site, celles mises en avant et celles intégrées au carrousel principal."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {carouselOnly ? (
              <Link
                href="/site-internet/releases"
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-white"
              >
                Toutes les releases
              </Link>
            ) : (
              <Link
                href="/site-internet/releases?filter=carousel"
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold transition hover:border-yellow-500 hover:text-yellow-500"
              >
                Voir le carrousel
              </Link>
            )}

            <a
              href="https://legacymusicgroup.fr/site/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            >
              Voir le site →
            </a>
          </div>
        </div>

        {/* STATS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Total"
            value={releases.length}
          />

          <Stat
            label="Publiques"
            value={
              releases.filter(
                (release) => release.is_public
              ).length
            }
          />

          <Stat
            label="Featured"
            value={
              releases.filter(
                (release) => release.featured
              ).length
            }
          />

          <Stat
            label="Carrousel"
            value={
              releases.filter(
                (release) =>
                  release.show_in_carousel
              ).length
            }
          />
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {/* LISTE */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {visibleReleases.length}{" "}
              {visibleReleases.length > 1
                ? "releases"
                : "release"}
            </p>
          </div>

          <div className="space-y-4">
            {visibleReleases.map((release) => {
              const artist = getArtist(
                release.artistes
              );

              const image =
                release.cover_url ||
                release.hero_image_url;

              const saving =
                savingId === release.id;

              return (
                <article
                  key={release.id}
                  className={`rounded-[2rem] border bg-zinc-950 p-5 transition ${
                    release.show_in_carousel
                      ? "border-yellow-500/40"
                      : "border-zinc-900"
                  }`}
                >
                  <div className="grid gap-6 xl:grid-cols-[100px_1fr_auto] xl:items-center">
                    {/* COVER */}
                    <div className="relative h-[100px] w-[100px] overflow-hidden rounded-2xl bg-zinc-900">
                      {image ? (
                        <Image
                          src={image}
                          alt={
                            release.titre ||
                            "Release LMG"
                          }
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                          No Cover
                        </div>
                      )}
                    </div>

                    {/* INFOS */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-500">
                          {release.type ||
                            "Release"}
                        </p>

                        {release.show_in_carousel && (
                          <Badge>
                            Hero
                          </Badge>
                        )}

                        {release.featured && (
                          <Badge>
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h2 className="mt-2 text-2xl font-black">
                        {release.titre ||
                          "Sans titre"}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                        <span>
                          {artist?.nom ||
                            "Artiste non renseigné"}
                        </span>

                        {release.date_sortie && (
                          <span>
                            {new Date(
                              release.date_sortie
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        )}

                        {!release.hero_image_url && (
                          <span className="text-orange-400">
                            Hero image manquante
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {release.slug && (
                          <a
                            href={`https://legacymusicgroup.fr/site/projets/${release.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-zinc-500 transition hover:text-white"
                          >
                            Voir la page →
                          </a>
                        )}

                        <Link
                          href={`/projets/${release.id}/modifier`}
                          className="text-xs font-semibold text-zinc-500 transition hover:text-white"
                        >
                          Modifier le projet →
                        </Link>
                      </div>
                    </div>

                    {/* CONTROLES */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-4">
                      <ToggleControl
                        label="Public"
                        active={Boolean(
                          release.is_public
                        )}
                        disabled={saving}
                        onClick={() =>
                          togglePublic(release)
                        }
                      />

                      <ToggleControl
                        label="Featured"
                        active={Boolean(
                          release.featured
                        )}
                        disabled={saving}
                        onClick={() =>
                          toggleFeatured(release)
                        }
                      />

                      <ToggleControl
                        label="Carrousel"
                        active={Boolean(
                          release.show_in_carousel
                        )}
                        disabled={saving}
                        onClick={() =>
                          toggleCarousel(release)
                        }
                      />

                      <div>
                        <p className="mb-2 text-xs text-zinc-500">
                          Ordre
                        </p>

                        <input
                          type="number"
                          min={0}
                          defaultValue={
                            release.display_order ?? 0
                          }
                          disabled={saving}
                          onBlur={(e) =>
                            updateOrder(
                              release,
                              Number(
                                e.target.value
                              ) || 0
                            )
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-center text-sm outline-none transition focus:border-yellow-500"
                        />
                      </div>
                    </div>
                  </div>

                  {saving && (
                    <p className="mt-4 text-xs text-yellow-500">
                      Enregistrement...
                    </p>
                  )}
                </article>
              );
            })}

            {visibleReleases.length === 0 && (
              <div className="rounded-[2rem] border border-zinc-900 bg-zinc-950 px-6 py-20 text-center">
                <p className="text-zinc-500">
                  {carouselOnly
                    ? "Aucune release n’est actuellement dans le carrousel."
                    : "Aucune release disponible."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ToggleControl({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-500">
        {label}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          active
            ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-500"
            : "border-zinc-800 bg-black text-zinc-500 hover:border-zinc-700"
        }`}
      >
        <span>{active ? "Oui" : "Non"}</span>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            active
              ? "bg-yellow-500"
              : "bg-zinc-700"
          }`}
        />
      </button>
    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-yellow-500">
      {children}
    </span>
  );
}

function Stat({
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

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
  );
}