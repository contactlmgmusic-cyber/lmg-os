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

  const { data } = await supabase
    .from("artistes")
    .select("*")
    .eq("slug", slug)
    .limit(1);

  const artiste = data?.[0];

  if (!artiste) notFound();

  const { data: projets } = await supabase
    .from("projets")
    .select("id, titre, slug, cover_url, date_sortie, type")
    .eq("artiste_id", artiste.id)
    .not("slug", "is", null)
    .order("date_sortie", { ascending: false });

  const latestProject = projets?.[0];
  const otherProjects = projets?.slice(1) || [];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        {artiste.photo_url && (
          <Image
            src={artiste.photo_url}
            alt={artiste.nom || "Artiste LMG"}
            fill
            priority
            className="absolute inset-0 object-cover opacity-20 blur-2xl"
          />
        )}

        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Link href="/site#artists" className="text-sm text-zinc-400 hover:text-white">
            ← Retour aux artistes
          </Link>

          <div className="mt-12 grid gap-12 lg:grid-cols-[45%_55%]">
            <div className="relative h-[620px] overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900">
              {artiste.photo_url ? (
                <Image
                  src={artiste.photo_url}
                  alt={artiste.nom || "Artiste LMG"}
                  fill
                  priority
                  className="object-cover transition duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  Photo indisponible
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">
                {artiste.style || "Artist"}
              </p>

              <h1 className="mt-4 text-6xl font-black uppercase md:text-8xl">
                {artiste.nom}
              </h1>

              <div className="mt-6 h-[2px] w-24 bg-yellow-500" />

              <div className="mt-6 space-y-2">
                <p className="text-xl text-zinc-300">
                  {artiste.ville || "Legacy Music Group"}
                </p>

                {artiste.statut && (
                  <p className="inline-block rounded-full border border-yellow-500 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-yellow-500">
                    {artiste.statut}
                  </p>
                )}
              </div>

              <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8 text-zinc-300">
                {artiste.bio ||
                  artiste.notes ||
                  "Artiste accompagné par Legacy Music Group."}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                {artiste.spotify && (
                  <a href={artiste.spotify} target="_blank" className="rounded-full bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400">
                    Spotify
                  </a>
                )}

                {artiste.instagram && (
                  <a href={artiste.instagram} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    Instagram
                  </a>
                )}

                {artiste.tiktok && (
                  <a href={artiste.tiktok} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    TikTok
                  </a>
                )}

                {artiste.youtube && (
                  <a href={artiste.youtube} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    YouTube
                  </a>
                )}

                {artiste.apple_music && (
                  <a href={artiste.apple_music} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    Apple Music
                  </a>
                )}

                {artiste.deezer && (
                  <a href={artiste.deezer} target="_blank" className="rounded-full border border-zinc-700 px-6 py-3 hover:border-yellow-500">
                    Deezer
                  </a>
                )}
              </div>

              <Link
                href="/site#contact"
                className="mt-10 inline-block w-fit rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
              >
                Contacter LMG
              </Link>
            </div>
          </div>

          {latestProject && (
            <section className="mt-24">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
                Latest Release
              </p>

              <h2 className="text-4xl font-black">Dernière sortie</h2>

              <Link
                href={`/site/projets/${latestProject.slug}`}
                className="mt-10 grid overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition hover:border-yellow-500 md:grid-cols-[35%_65%]"
              >
                <div className="relative aspect-square bg-zinc-900">
                  {latestProject.cover_url ? (
                    <Image
                      src={latestProject.cover_url}
                      alt={latestProject.titre || "Release LMG"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      No Cover
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center p-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
                    {latestProject.type || "Release"}
                  </p>

                  <h3 className="mt-3 text-4xl font-black">
                    {latestProject.titre}
                  </h3>

                  <p className="mt-4 text-zinc-500">
                    {latestProject.date_sortie
                      ? new Date(latestProject.date_sortie).toLocaleDateString("fr-FR")
                      : "Date à venir"}
                  </p>

                  <p className="mt-6 font-bold text-yellow-500">
                    Découvrir le projet →
                  </p>
                </div>
              </Link>
            </section>
          )}

          {otherProjects.length > 0 && (
            <section className="mt-24">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-yellow-500">
                Releases
              </p>

              <h2 className="text-4xl font-black">Toutes les sorties</h2>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {otherProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/site/projets/${project.slug}`}
                    className="group overflow-hidden rounded-[2rem] border border-zinc-800 bg-black transition hover:border-yellow-500"
                  >
                    <div className="relative aspect-square bg-zinc-900">
                      {project.cover_url ? (
                        <Image
                          src={project.cover_url}
                          alt={project.titre || "Release LMG"}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          No Cover
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
                        {project.type || "Release"}
                      </p>

                      <h3 className="mt-3 text-2xl font-black">
                        {project.titre}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        {project.date_sortie
                          ? new Date(project.date_sortie).toLocaleDateString("fr-FR")
                          : "Date à venir"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}