"use client";

import Link from "next/link";

import Navbar from "@/components/site/Navbar";
import LatestReleases from "@/components/site/LatestReleases";
import LatestNews from "@/components/site/LatestNews";
import Footer from "@/components/site/Footer";
import ReleasesCarousel from "@/components/site/ReleasesCarousel";
import { useSiteLanguage } from "@/components/site/LanguageProvider";

export default function SitePage() {
  const { t } = useSiteLanguage();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <ReleasesCarousel />

      <LatestReleases />

      {/* LIVE & ENTERTAINMENT */}
      <section className="border-t border-zinc-900 bg-[#070707]">
        <div className="mx-auto grid min-h-[620px] max-w-[1600px] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[420px] overflow-hidden bg-zinc-950 lg:min-h-[620px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,184,0,0.14),transparent_45%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-yellow-500">
                  LMG MUSIC
                </p>

                <p className="mt-5 text-5xl font-black uppercase tracking-[-0.05em] text-white/10 md:text-7xl">
                  LIVE
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              Live image
            </div>
          </div>

          <div className="flex items-center px-6 py-16 md:px-12 lg:px-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-yellow-500">
                {t.home.liveEyebrow}
              </p>

              <h2 className="mt-5 text-3xl font-semibold uppercase leading-[1.02] tracking-[-0.025em] md:text-5xl">
                {t.home.liveTitle}
              </h2>

              <p className="mt-5 text-xl font-medium uppercase tracking-[-0.02em] text-zinc-400">
                {t.home.liveSubtitle}
              </p>

              <p className="mt-8 max-w-md text-sm leading-7 text-zinc-500">
                {t.home.liveDescription}
              </p>

              <Link
                href="/about/live"
                className="mt-9 inline-flex items-center gap-3 border-b border-yellow-500 pb-2 text-sm font-semibold text-white transition hover:text-yellow-500"
              >
                {t.home.liveCta}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LatestNews />

      {/* PROJECT CTA */}
      <section className="border-t border-zinc-900 bg-yellow-500 px-6 py-14 text-black md:px-8 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/55">
              {t.home.projectEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] md:text-4xl">
              {t.home.projectTitle}
            </h2>

            <p className="mt-3 max-w-xl text-sm text-black/65">
              {t.home.projectDescription}
            </p>
          </div>

          <Link
            href="/rejoindre"
            className="inline-flex w-fit shrink-0 items-center gap-5 rounded-full bg-black px-7 py-3.5 text-sm font-bold text-white transition hover:scale-[1.02]"
          >
            {t.home.projectCta}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
