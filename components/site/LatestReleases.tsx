"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LatestReleases() {
  const [releases, setReleases] = useState<any[]>([]);

  useEffect(() => {
    async function loadReleases() {
      const { data } = await supabaseBrowser
        .from("projets")
        .select(`
          id,
          titre,
          slug,
          type,
          cover_url,
          date_sortie,
          artistes (
            nom
          )
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
    <section className="border-t border-zinc-900 bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
              Latest Releases
            </p>

            <h2 className="text-4xl font-black uppercase md:text-6xl">
              Dernières sorties
            </h2>
          </div>

          <Link
            href="/site/releases"
            className="text-sm font-semibold text-zinc-400 transition hover:text-yellow-500"
          >
            Voir toutes les sorties →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {releases.map((release) => {
            const artist = getArtist(release.artistes);

            return (
              <Link
                key={release.id}
                href={`/site/projets/${release.slug}`}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-zinc-900 bg-zinc-900 transition duration-500 group-hover:border-zinc-700">
                  {release.cover_url ? (
                    <Image
                      src={release.cover_url}
                      alt={release.titre || "Release LMG"}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      No Cover
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
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

                  <h3 className="mt-3 text-3xl font-black uppercase leading-none text-white transition group-hover:text-yellow-500">
                    {release.titre}
                  </h3>

                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-zinc-400">
                    {artist?.nom || "Legacy Music Group"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}