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
  <section className="relative overflow-hidden">
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

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-9xl font-thin text-white/25 transition hover:text-white"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-9xl font-thin text-white/25 transition hover:text-white"
      >
        ›
      </button>

      <div className="absolute inset-0 z-20 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-8 pb-32">
          <h3 className="max-w-3xl text-4xl font-black uppercase text-white md:text-6xl">
            {release.titre}
          </h3>

          <p className="mt-4 text-xl text-zinc-300">
            {release.artistes?.nom || "Legacy Music Group"}
          </p>

          <Link
            href={`/site/projets/${release.slug}`}
            className="mt-8 inline-block text-lg font-semibold text-yellow-500 transition hover:text-yellow-400"
          >
            Découvrir →
          </Link>
        </div>
      </div>

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
  </section>
);
}