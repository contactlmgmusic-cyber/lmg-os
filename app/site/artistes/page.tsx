import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Artistes | Legacy Music Group",
  description:
    "Découvrez les artistes accompagnés par Legacy Music Group.",
};

export default async function ArtistsPage() {
  const { data: artists } = await supabase
    .from("artistes")
    .select(`
      id,
      nom,
      slug,
      style,
      ville,
      photo_url,
      spotify_image_url,
      youtube_image_url
    `)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false });

  const publicArtists = artists || [];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="border-b border-zinc-900 px-6 pb-20 pt-36 md:px-8 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/site"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Retour au site
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.4em] text-yellow-500">
            Legacy Music Group
          </p>

          <h1 className="mt-5 text-6xl font-black uppercase leading-none md:text-8xl">
            Artistes
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Découvrez les artistes que Legacy Music Group accompagne dans leur
            développement, leur image et leur stratégie de carrière.
          </p>
        </div>
      </section>

      {/* ROSTER */}
      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
              Roster
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Artistes LMG
            </h2>
          </div>

          {publicArtists.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {publicArtists.map((artist) => {
                const image =
                  artist.photo_url ||
                  artist.spotify_image_url ||
                  artist.youtube_image_url;

                return (
                  <Link
                    key={artist.id}
                    href={`/site/artistes/${artist.slug}`}
                    className="group"
                  >
                    <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950 transition duration-500 group-hover:border-zinc-700">
                      {image ? (
                        <Image
                          src={image}
                          alt={artist.nom || "Artiste LMG"}
                          fill
                          className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                          Photo indisponible
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
                          {artist.style || "Artist"}
                        </p>

                        <h3 className="mt-3 text-5xl font-black uppercase leading-none md:text-6xl">
                          {artist.nom}
                        </h3>

                        {artist.ville && (
                          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-zinc-400">
                            {artist.ville}
                          </p>
                        )}

                        <p className="mt-7 translate-x-2 font-semibold text-white/70 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          Découvrir l&apos;artiste →
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center text-zinc-500">
              Aucun artiste public pour le moment.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-28 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Build Your Legacy
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Tu veux rejoindre le roster ?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Présente ton projet à Legacy Music Group et fais-nous découvrir ton
            univers.
          </p>

          <Link
            href="/site/rejoindre"
            className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Présenter mon projet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}