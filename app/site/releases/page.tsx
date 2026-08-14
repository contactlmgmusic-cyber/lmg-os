import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default async function ReleasesPage() {
  const { data: releases } = await supabase
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
        nom,
        slug
      )
    `)
    .eq("is_public", true)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

    const getArtist = (artistes: any) => {
  if (Array.isArray(artistes)) {
    return artistes[0];
  }

  return artistes;
};

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
            Releases
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Découvrez les sorties des artistes accompagnés par Legacy Music Group.
          </p>
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="px-6 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          {releases && releases.length > 0 ? (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {releases.map((release) => (
                <Link
                  key={release.id}
                  href={`/site/projets/${release.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-zinc-900">
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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  </div>

                  <div className="pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
                        {release.type || "Release"}
                      </p>

                      {release.date_sortie && (
                        <p className="text-sm text-zinc-600">
                          {new Date(release.date_sortie).getFullYear()}
                        </p>
                      )}
                    </div>

                    <h2 className="mt-3 text-3xl font-black uppercase transition group-hover:text-yellow-500">
                      {release.titre}
                    </h2>

                    <p className="mt-2 text-zinc-400">
  {getArtist(release.artistes)?.nom || "Legacy Music Group"}
</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-zinc-500">
                Aucune sortie publique pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 bg-zinc-950 px-6 py-24 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
            Build Your Legacy
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Découvrir les artistes LMG
          </h2>

          <Link
            href="/site#artists"
            className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Voir les artistes
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}