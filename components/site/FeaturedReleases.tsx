"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function FeaturedReleases() {
  const [projets, setProjets] = useState<any[]>([]);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabaseBrowser
        .from("projets")
        .select(`
          *,
          artistes (
            nom,
            slug
          )
        `)
        .order("date_sortie", { ascending: false })
        .limit(6);

      setProjets(data || []);
    }

    loadProjects();
  }, []);

  return (
    <section className="bg-zinc-950 px-6 py-28">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projets.map((projet) => (
            <Link
              key={projet.id}
              href={`/site/projets/${projet.slug || projet.id}`}
              className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition hover:border-yellow-500"
            >
              <div className="relative aspect-square bg-zinc-900">
                {projet.cover_url ? (
                  <Image
                    src={projet.cover_url}
                    alt={projet.titre || "Projet LMG"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600">
                    No Cover
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500 backdrop-blur">
                  {projet.type || "Release"}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-3xl font-black text-white">
                  {projet.titre}
                </h3>

                <p className="mt-2 text-zinc-400">
                  {projet.artistes?.nom || "Legacy Music Group"}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-5">
                  <p className="text-sm text-zinc-500">
                    {projet.date_sortie || "Date à venir"}
                  </p>

                  <span className="text-sm font-bold text-yellow-500">
                    Découvrir →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projets.length === 0 && (
          <p className="mt-10 text-zinc-500">
            Aucune sortie publiée pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}