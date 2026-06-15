"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ReleasesCarousel() {
  const [releases, setReleases] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

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
        .not("slug", "is", null)
        .order("date_sortie", { ascending: false })
        .limit(6);

      setReleases(data || []);
    }

    loadReleases();
  }, []);

  useEffect(() => {
    if (releases.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % releases.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [releases.length]);

  if (releases.length === 0) return null;

  const release = releases[current];

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-500">
              Latest Releases
            </p>

            <h2 className="text-4xl font-black uppercase md:text-7xl">
              Dernières sorties
            </h2>
          </div>

          <div className="hidden gap-2 md:flex">
            {releases.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? "w-10 bg-yellow-500"
                    : "w-2 bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        <Link
          href={`/site/projets/${release.slug}`}
          className="group grid overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950 transition hover:border-yellow-500 lg:grid-cols-[55%_45%]"
        >
          <div className="relative h-[480px] bg-zinc-900 md:h-[620px]">
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

          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              {release.type || "Release"}
            </p>

            <h3 className="mt-5 text-5xl font-black uppercase md:text-7xl">
              {release.titre}
            </h3>

            <p className="mt-6 text-xl text-zinc-300">
              {release.artistes?.nom || "Legacy Music Group"}
            </p>

            <p className="mt-3 text-zinc-500">
              {release.date_sortie
                ? new Date(release.date_sortie).toLocaleDateString("fr-FR")
                : "Date à venir"}
            </p>

            <p className="mt-10 font-bold text-yellow-500">
              Découvrir le projet →
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}