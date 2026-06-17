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
  hero_image_url,
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

  const heroImage = release.hero_image_url || release.cover_url;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % releases.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? releases.length - 1 : prev - 1));
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-900 bg-black">
      <div className="relative flex min-h-[620px] w-full items-center justify-center overflow-hidden">
        {heroImage && (
          <>
            <Image
              key={`${release.id}-blur`}
              src={heroImage}
              alt=""
              fill
              priority
              className="absolute inset-0 scale-[1.45] object-cover object-center opacity-60 blur-[80px]"
            />

            <div className="absolute inset-0 bg-black/60" />
          </>
        )}

        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
        >
          ›
        </button>

        <div className="relative z-20 flex w-full items-center justify-center">
          <div className="absolute left-16 top-1/2 hidden -translate-y-1/2 text-left lg:block">
  <h3 className="text-6xl font-black uppercase leading-none text-white">
    {release.titre}
  </h3>

  <p className="mt-4 text-xl uppercase tracking-[0.3em] text-zinc-300">
    {release.artistes?.nom || "Legacy Music Group"}
  </p>
</div>

<Link href={`/site/projets/${release.slug}`}>
  <div className="relative h-[320px] w-[560px] max-w-[90vw] overflow-hidden rounded-[22px] shadow-2xl transition duration-500 hover:scale-[1.02] md:h-[360px] md:w-[640px]">
    {heroImage ? (
      <Image
        key={release.id}
        src={heroImage}
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

           <div className="mt-6 text-center lg:hidden">
    <h3 className="text-3xl font-black uppercase text-white">
      {release.titre}
    </h3>

    <p className="mt-2 uppercase tracking-[0.25em] text-zinc-300">
      {release.artistes?.nom}
    </p>
  </div>
</div>

        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
          {releases.map((_, index) => (
            <button
              key={index}
              type="button"
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