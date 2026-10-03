"use client";

import Image from "next/image";
import Link from "next/link";

import { useSiteLanguage } from "@/components/site/LanguageProvider";

type Artist = {
  id: string;
  nom: string | null;
  slug: string | null;
  style: string | null;
  ville: string | null;
  photo_url: string | null;
  spotify_image_url: string | null;
  youtube_image_url: string | null;
};

const copy = {
  en: {
    eyebrow: "LMG Music / Artists",
    title: "Our Artists",
    intro:
      "Discover the artists and creative worlds developed alongside LMG Music.",
    roster: "Roster",
    discover: "Discover artist",
    unavailable: "Photo unavailable",
    empty: "No artists are currently available.",
    projectEyebrow: "Artist submissions",
    projectTitle: "Have a project to share?",
    projectText:
      "Introduce us to your music, your identity and the direction you want to build.",
    projectCta: "Present your project",
  },

  fr: {
    eyebrow: "LMG Music / Artistes",
    title: "Nos artistes",
    intro:
      "Découvrez les artistes et les univers créatifs développés aux côtés de LMG Music.",
    roster: "Roster",
    discover: "Découvrir l’artiste",
    unavailable: "Photo indisponible",
    empty: "Aucun artiste n’est disponible pour le moment.",
    projectEyebrow: "Projets artistiques",
    projectTitle: "Un projet à nous présenter ?",
    projectText:
      "Présentez-nous votre musique, votre identité et la direction que vous souhaitez construire.",
    projectCta: "Présenter votre projet",
  },
} as const;

export default function ArtistsContent({
  artists,
}: {
  artists: Artist[];
}) {
  const { locale } = useSiteLanguage();
  const c = copy[locale];

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="border-b border-white/10 px-6 pb-16 pt-32 md:px-8 md:pb-20 md:pt-36">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
            {c.eyebrow}
          </p>

          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-semibold tracking-[-0.045em] md:text-6xl lg:text-7xl">
                {c.title}
              </h1>
            </div>

            <div className="lg:col-span-5 lg:pb-1">
              <p className="max-w-md text-base leading-7 text-white/50">
                {c.intro}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROSTER */}
      <section className="px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
              {c.roster}
            </p>

            <p className="text-xs text-white/35">
              {String(artists.length).padStart(2, "0")}
            </p>
          </div>

          {artists.length > 0 ? (
            <div className="grid gap-x-5 gap-y-12 md:grid-cols-2">
              {artists.map((artist, index) => {
                const image =
                  artist.photo_url ||
                  artist.spotify_image_url ||
                  artist.youtube_image_url;

                return (
                  <Link
                    key={artist.id}
                    href={`/artistes/${artist.slug}`}
                    className="group block"
                  >
                    <article>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-zinc-950">
                        {image ? (
                          <Image
                            src={image}
                            alt={artist.nom || "LMG Music artist"}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/25">
                            {c.unavailable}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                        <div className="absolute left-5 top-5">
                          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        {artist.style && (
                          <div className="absolute bottom-5 left-5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                              {artist.style}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-6 pt-5">
                        <div>
                          <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                            {artist.nom}
                          </h2>

                          {artist.ville && (
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">
                              {artist.ville}
                            </p>
                          )}
                        </div>

                        <span className="mt-1 text-xl text-white/30 transition duration-300 group-hover:translate-x-1 group-hover:text-yellow-500">
                          →
                        </span>
                      </div>

                      <p className="mt-4 text-xs font-medium text-white/40 transition group-hover:text-white/70">
                        {c.discover}
                      </p>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center text-sm text-white/35">
              {c.empty}
            </div>
          )}
        </div>
      </section>

      {/* PROJECT CTA */}
      <section className="border-t border-white/10 px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 rounded-[1.5rem] border border-white/10 bg-zinc-950/70 p-7 md:p-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-500">
                {c.projectEyebrow}
              </p>

              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                {c.projectTitle}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">
                {c.projectText}
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/rejoindre"
                className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
              >
                {c.projectCta}
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
