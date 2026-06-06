import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: artistes, error } = await supabase
  .from("artistes")
  .select("*")
  .eq("slug", slug)
  .limit(1);

const artiste = artistes?.[0];

if (!artiste) {
  console.log("ARTISTE INTROUVABLE", { slug, artistes, error });
  notFound();
}

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-28">
        <Link href="/site" className="text-sm text-zinc-400 hover:text-white">
          ← Retour au site
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="relative h-[600px] overflow-hidden rounded-3xl bg-zinc-950">
            {artiste.photo_url ? (
              <Image
                src={artiste.photo_url}
                alt={artiste.nom || "Artiste LMG"}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Aucune photo
              </div>
            )}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              {artiste.style || "Artist"}
            </p>

            <h1 className="mt-4 text-6xl font-black">{artiste.nom}</h1>

            <p className="mt-4 text-zinc-500">
              {artiste.ville || "Legacy Music Group"}
            </p>

            <p className="mt-8 whitespace-pre-line text-lg leading-8 text-zinc-300">
              {artiste.bio || "Artiste accompagné par Legacy Music Group."}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {artiste.instagram && (
                <a href={artiste.instagram} target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 hover:border-yellow-500">
                  Instagram
                </a>
              )}

              {artiste.spotify && (
                <a href={artiste.spotify} target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 hover:border-yellow-500">
                  Spotify
                </a>
              )}

              {artiste.youtube && (
                <a href={artiste.youtube} target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 hover:border-yellow-500">
                  YouTube
                </a>
              )}

              {artiste.tiktok && (
                <a href={artiste.tiktok} target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 hover:border-yellow-500">
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}