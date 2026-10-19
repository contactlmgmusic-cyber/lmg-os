"use client";

import { publicReleaseArtist } from "@/lib/public-release-artist";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteLanguage } from "@/components/site/LanguageProvider";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ReleasesCarousel() {
  const { locale } = useSiteLanguage();
  const [releases, setReleases] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function loadReleases() {
      const carouselQuery = () => supabaseBrowser
  .from("public_projets")
  .select(`
    id,
    titre,
    slug,
    type,
    cover_url,
    hero_image_url,
    date_sortie,
    display_order,
    show_in_carousel,
    artistes
  `)
  .eq("is_public", true)
  .eq("show_in_carousel", true)
  .not("slug", "is", null)
  .order("display_order", { ascending: true })
  .order("date_sortie", { ascending: false })
  .limit(6);

      let { data, error } = await carouselQuery();

      // Compatibilité pendant le déploiement de la migration Supabase :
      // l'ancienne vue publique ne contient pas encore show_in_carousel.
      if (error) {
        const fallback = await supabaseBrowser
          .from("public_projets")
          .select(`
            id,
            titre,
            slug,
            type,
            cover_url,
            hero_image_url,
            date_sortie,
            display_order,
            artistes
          `)
          .eq("is_public", true)
          .eq("featured", true)
          .not("slug", "is", null)
          .order("display_order", { ascending: true })
          .order("date_sortie", { ascending: false })
          .limit(6);

        data = fallback.data?.map((item) => ({
          ...item,
          show_in_carousel: true,
        })) || null;
      }

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
              sizes="100vw"
              className="absolute inset-0 scale-[1.8] object-cover object-center opacity-90 blur-[140px]"
            />

            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        <button
          type="button"
          aria-label={locale === "fr" ? "Sortie précédente" : "Previous release"}
          onClick={prevSlide}
          className="absolute left-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
        >
          ‹
        </button>

        <button
          type="button"
          aria-label={locale === "fr" ? "Sortie suivante" : "Next release"}
          onClick={nextSlide}
          className="absolute right-8 top-1/2 z-30 -translate-y-1/2 text-8xl font-thin text-white/50 transition hover:text-white"
        >
          ›
        </button>

        <div className="relative z-20 flex w-full flex-col items-center justify-center px-6 lg:flex-row">
         <div className="hidden lg:absolute lg:left-[7%] lg:top-1/2 lg:block lg:max-w-[280px] lg:-translate-y-1/2 lg:text-left">
  <p className="mb-3 text-sm uppercase tracking-[0.4em] text-zinc-400">
    {publicReleaseArtist<{nom?: string}>(release.artistes, release.slug)?.nom ? (locale === "fr" ? "Artiste" : "Artist") : (locale === "fr" ? "Sortie à la une" : "Featured release")}
  </p>

  <p className="text-3xl font-black uppercase text-white">
    {publicReleaseArtist<{nom?: string}>(release.artistes, release.slug)?.nom || release.titre}
  </p>
</div>

<Link href={`/projets/${release.slug}`}>
  <div className="relative h-[420px] w-[92vw] max-w-[420px] overflow-hidden rounded-[22px] shadow-2xl transition duration-500 hover:scale-[1.02] lg:h-[450px] lg:w-[760px] lg:max-w-none xl:w-[900px]">
    {heroImage ? (
      <Image
        key={release.id}
        src={heroImage}
        alt={release.titre || "Release LMG"}
        fill
        priority
        sizes="(max-width: 1023px) 92vw, (max-width: 1279px) 760px, 900px"
        className="object-cover object-center"
      />
    ) : (
      <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-400">
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
      {publicReleaseArtist<{nom?: string}>(release.artistes, release.slug)?.nom || release.titre}
    </p>
  </div>
</div>

<div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 gap-3">
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
