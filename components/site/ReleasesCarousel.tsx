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
  <section className="relative bg-black overflow-hidden border-y border-zinc-900">
    <div className="relative h-[720px] flex items-center justify-center">

      {/* Flèche gauche */}
      <button
        onClick={prevSlide}
        className="absolute left-8 z-30 text-8xl font-thin text-white/30 transition hover:text-white"
      >
        ‹
      </button>

      {/* Flèche droite */}
      <button
        onClick={nextSlide}
        className="absolute right-8 z-30 text-8xl font-thin text-white/30 transition hover:text-white"
      >
        ›
      </button>

      {/* Contenu */}
      <div className="flex flex-col items-center text-center">

        {/* Cover */}
        <Link href={`/site/projets/${release.slug}`}>
          <div className="relative h-[520px] w-[520px] overflow-hidden rounded-[20px] shadow-2xl transition duration-500 hover:scale-[1.02]">
            {release.cover_url ? (
              <Image
                src={release.cover_url}
                alt={release.titre}
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

        {/* Infos */}
        <div className="mt-10">
          <h3 className="text-5xl font-black uppercase text-white md:text-7xl">
            {release.titre}
          </h3>

          <p className="mt-4 text-xl text-zinc-400">
            {release.artistes?.nom}
          </p>

          <Link
            href={`/site/projets/${release.slug}`}
            className="mt-6 inline-block font-semibold text-yellow-500 transition hover:text-yellow-400"
          >
            Découvrir →
          </Link>
        </div>

      </div>

      {/* Pagination */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3">
        {releases.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition ${
              index === current
                ? "bg-yellow-500"
                : "bg-white/40"
            }`}
          />
        ))}
      </div>

    </div>
  </section>
);
}