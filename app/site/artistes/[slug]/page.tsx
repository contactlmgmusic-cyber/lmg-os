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
      <section className="mx-auto max-w-7xl px-6 py-28">
        <Link href="/site#artists" className="text-sm text-zinc-400 hover:text-white">
          ← Retour aux artistes
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[45%_55%]">
          <div className="relative h-[600px] overflow-hidden rounded-3xl bg-zinc-900">
            {artiste.photo_url ? (
              <Image
                src={artiste.photo_url}
                alt={artiste.nom || "Artiste LMG"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Aucune photo
              </div>
            )}
          </div>

          <div>

  <div className="relative z-10">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              {artiste.style || "Artist"}
            </p>

            <h1 className="mt-4 text-7xl font-black">
  {artiste.nom}
</h1>
</div>
<div className="mt-6 h-[2px] w-24 bg-yellow-500" />

            <p className="mt-4 text-zinc-500">
              {artiste.ville || "Legacy Music Group"}
            </p>

            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-yellow-500">
  Artiste accompagné par LMG
</p>

            <p className="mt-8 whitespace-pre-line text-xl leading-9 text-zinc-300">
              {artiste.bio || "Artiste accompagné par Legacy Music Group."}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {artiste.instagram && (
                <a href={artiste.instagram} target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 hover:border-yellow-500">
                  Instagram
                </a>
              )}

              <Link
  href="/site#contact"
  className="rounded-full bg-yellow-500 px-5 py-3 font-bold text-black hover:bg-yellow-400"
>
  Contacter LMG
</Link>

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