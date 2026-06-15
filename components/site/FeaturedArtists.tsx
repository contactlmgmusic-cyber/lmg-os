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

        <div className="grid gap-6 md:grid-cols-2">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/site/artistes/${artist.slug || artist.id}`}
              className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition duration-300 hover:-translate-y-2 hover:border-yellow-500"
            >
              <div className="relative h-[700px] overflow-hidden bg-zinc-900">
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

                <div className="absolute bottom-10 left-10 right-10">
  <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
    {artist.style || "Artist"}
  </p>

  <h3 className="mt-3 text-5xl font-black uppercase text-white">
    {artist.nom}
  </h3>

  <span className="mt-6 inline-block text-lg font-semibold text-white">
    Découvrir →
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