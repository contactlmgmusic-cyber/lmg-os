"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Artist = {
  id: string;
  nom: string | null;
  style: string | null;
  photo_url: string | null;
  bio: string | null;
  slug: string | null;
  ville: string | null;
};

export default function FeaturedArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadArtists() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom, style, photo_url, bio, slug, ville")
        .eq("featured", true)
        .order("created_at", { ascending: false });

      setArtists(data || []);
    }

    loadArtists();
  }, []);

  return (
    <section id="artists" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
              Artists
            </p>

            <h2 className="text-4xl font-black md:text-6xl">
              Les talents accompagnés
            </h2>
          </div>

          <p className="max-w-xl text-zinc-400">
            Legacy Music Group accompagne des artistes à fort potentiel dans
            leur développement, leur image et leur stratégie musicale.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/site/artistes/${artist.slug || artist.id}`}
              className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition duration-300 hover:-translate-y-2 hover:border-yellow-500"
            >
              <div className="relative h-96 bg-zinc-900">
                {artist.photo_url ? (
                  <Image
                    src={artist.photo_url}
                    alt={artist.nom || "Artiste LMG"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    Aucune photo
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
                    {artist.style || "Artist"}
                  </p>

                  <h3 className="mt-3 text-4xl font-black text-white">
                    {artist.nom}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-300">
                    {artist.ville || "Legacy Music Group"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <p className="line-clamp-3 text-sm leading-6 text-zinc-400">
                  {artist.bio || "Artiste accompagné par Legacy Music Group."}
                </p>

                <div className="mt-6 border-t border-zinc-900 pt-5">
                  <span className="text-sm font-bold text-yellow-500">
                    Voir le profil →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {artists.length === 0 && (
          <p className="mt-10 text-zinc-500">
            Aucun artiste mis en avant pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}