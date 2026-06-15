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
    }, 5000);

    return () => clearInterval(interval);
  }, [releases.length]);

  if (releases.length === 0) return null;

  const release = releases[current];

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % releases.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? releases.length - 1 : prev - 1));
  };

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute left-8 top-8 z-20 md:left-14 md:top-14">
        <p className="mb-3 text-sm uppercase tracking-[0.4em] text-yellow-500">
          Latest Releases
        </p>

        <h2 className="text-4xl font-black uppercase text-white md:text-7xl">
          Dernières sorties
        </h2>
      </div>

      <div className="relative h-[85vh] min-h-[680px] w-full overflow-hidden">
        {release.cover_url ? (
          <Image
            key={release.id}
            src={release.cover_url}
            alt={release.titre || "Release LMG"}
            fill
            priority
            className="object-cover transition duration-700"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-600">
            No Cover
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

        <button
  onClick={prevSlide}
  className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-7xl font-thin text-white/60 transition hover:text-white"
>
  ‹
</button>

<button
  onClick={nextSlide}
  className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-7xl font-thin text-white/60 transition hover:text-white"
>
  ›
</button>

        <div className="absolute inset-0 z-20 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-8 pb-20 md:pb-24">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              {release.type || "Release"}
            </p>

            <h3 className="mt-4 max-w-4xl text-5xl font-black uppercase text-white md:text-8xl">
              {release.titre}
            </h3>

            <p className="mt-5 text-xl text-zinc-300">
              {release.artistes?.nom || "Legacy Music Group"}
            </p>

            <p className="mt-2 text-zinc-500">
              {release.date_sortie
                ? new Date(release.date_sortie).toLocaleDateString("fr-FR")
                : "Date à venir"}
            </p>

            <Link
              href={`/site/projets/${release.slug}`}
              className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
            >
              Découvrir le projet
            </Link>

            <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
  {releases.map((_, index) => (
    <button
      key={index}
      onClick={() => setCurrent(index)}
      className={`h-3 w-3 rounded-full transition-all ${
        index === current
          ? "bg-yellow-500"
          : "bg-white/60"
      }`}
    />
  ))}
</div>
          </div>
        </div>
      </div>
    </section>
  );
}