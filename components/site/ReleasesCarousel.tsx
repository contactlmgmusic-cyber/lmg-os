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
  <section className="relative overflow-hidden border-y border-zinc-900 bg-black">
    <div className="relative mx-auto flex h-[560px] w-full max-w-[1400px] items-center justify-center overflow-hidden px-6 pt-24">
      {release.cover_url && (
        <>
          <Image
            key={`${release.id}-blur`}
            src={release.cover_url}
            alt=""
            fill
            priority
            className="absolute inset-0 scale-[1.35] object-cover object-center opacity-60 blur-[70px]"
          />

          <div className="absolute inset-0 bg-black/60" />
        </>
      )}

      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
      >
        ›
      </button>

      <div className="relative z-20 flex flex-col items-center text-center">
        <Link href={`/site/projets/${release.slug}`}>
          <div className="relative h-[330px] w-[330px] overflow-hidden rounded-[18px] shadow-2xl transition duration-500 hover:scale-[1.02]">
            {release.cover_url ? (
              <Image
                key={release.id}
                src={release.cover_url}
                alt={release.titre || "Release LMG"}
                fill
                priority
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
                No Cover
              </div>
            )}
          </div>
        </Link>

        <div className="mt-6 text-center">
          <h3 className="text-3xl font-black uppercase leading-none text-white md:text-5xl">
            {release.titre}
          </h3>

          <p className="mt-3 text-sm font-medium uppercase tracking-[0.25em] text-zinc-300 md:text-base">
            {release.artistes?.nom || "Legacy Music Group"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {releases.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              index === current ? "bg-yellow-500" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  </section>
);
}