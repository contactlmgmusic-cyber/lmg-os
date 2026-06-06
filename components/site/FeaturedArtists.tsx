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
};

export default function FeaturedArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadArtists() {
      const { data } = await supabaseBrowser
        .from("artistes")
        .select("id, nom, style, photo_url, bio, slug")
        .eq("featured", true)
        .order("created_at", { ascending: false });

      setArtists(data || []);
    }

    loadArtists();
  }, []);

  return (
    <section id="artists" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
          Artists
        </p>

        <h2 className="text-4xl font-black md:text-6xl">
          Les talents accompagnés
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950"
            >
              <div className="relative h-80 bg-zinc-900">
                {artist.photo_url ? (
                  <Image
                    src={artist.photo_url}
                    alt={artist.nom || "Artiste LMG"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    Aucune photo
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
                  {artist.style || "Artist"}
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  {artist.nom}
                </h3>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                  {artist.bio || "Artiste accompagné par Legacy Music Group."}
                </p>

                <Link
                  href={`/site/artistes/${artist.slug || artist.id}`}
                  className="mt-6 inline-block rounded-full border border-yellow-500 px-5 py-2 text-sm font-bold text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Voir le profil
                </Link>
              </div>
            </div>
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