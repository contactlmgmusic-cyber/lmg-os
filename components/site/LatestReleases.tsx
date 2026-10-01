"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function LatestReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const { t } = useSiteLanguage();

  useEffect(() => {
    async function loadReleases() {
      const { data } = await supabaseBrowser
        .from("public_projets")
        .select(`
          id,
          titre,
          slug,
          type,
          cover_url,
          date_sortie,
          artistes
        `)
        .eq("is_public", true)
        .not("slug", "is", null)
        .order("date_sortie", { ascending: false })
        .limit(3);

      setReleases(data || []);
    }

    loadReleases();
  }, []);

  if (releases.length === 0) return null;

  const getArtist = (artistes: any) => {
    if (Array.isArray(artistes)) {
      return artistes[0];
    }

    return artistes;
  };

  return (
    <section className="border-t border-zinc-900 bg-black px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-yellow-500">
              {t.home.releasesEyebrow}
            </p>

            <h2 className="text-3xl font-semibold uppercase tracking-[-0.025em] md:text-5xl">
              {t.home.releasesTitle}
            </h2>
          </div>

          <Link
            href="/releases"
            className="hidden text-sm font-semibold text-zinc-400 transition hover:text-yellow-500 md:block"
          >
            {t.home.releasesAll} ↗
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {releases.map((release) => {
            const artist = getArtist(release.artistes);

            return (
              <Link
                key={release.id}
                href={`/projets/${release.slug}`}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  {release.cover_url ? (
                    <Image
                      src={release.cover_url}
                      alt={release.titre || "LMG Music release"}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      No Cover
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-500">
                    <span>{release.type || "Release"}</span>

                    {release.date_sortie && (
                      <>
                        <span className="text-zinc-700">•</span>
                        <span>
                          {new Date(release.date_sortie).getFullYear()}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-3 text-xl font-semibold uppercase leading-tight text-white transition group-hover:text-yellow-500 md:text-2xl">
                    {release.titre}
                  </h3>

                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {artist?.nom || "LMG Music"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/releases"
          className="mt-10 inline-block text-sm font-semibold text-zinc-400 transition hover:text-yellow-500 md:hidden"
        >
          {t.home.releasesAll} ↗
        </Link>
      </div>
    </section>
  );
}
