import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: media, error } = await supabase
    .from("medias")
    .select(`
      *,
      artistes (
        id,
        nom,
        style,
        photo_url
      ),
      projets (
        id,
        titre,
        type,
        statut
      )
    `)
    .eq("id", id)
    .single();

  if (error || !media) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Contact média introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <Link href="/medias" className="text-sm text-zinc-400 hover:text-white">
        ← Retour CRM Médias
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            {media.type || "Média"}
          </p>

          <h1 className="mt-3 text-5xl font-bold">{media.nom}</h1>

          <span className="mt-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            {media.statut || "À contacter"}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Plateforme</p>
              <p className="mt-2 text-xl font-semibold">
                {media.plateforme || "Non renseignée"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Contact</p>
              <p className="mt-2 text-xl font-semibold">
                {media.contact_nom || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Email</p>
              <p className="mt-2 text-xl font-semibold">
                {media.email || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm text-zinc-500">Instagram</p>
              <p className="mt-2 text-xl font-semibold">
                {media.instagram || "Non renseigné"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6">
            <h2 className="text-2xl font-bold">Notes</h2>

            <p className="mt-4 leading-relaxed text-zinc-400">
              {media.notes || "Aucune note renseignée."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Artiste lié</h2>

            {media.artistes ? (
              <Link
                href={`/artistes/${media.artistes.id}`}
                className="mt-6 block overflow-hidden rounded-2xl border border-zinc-800 bg-black hover:border-zinc-600"
              >
                <div className="h-56 bg-zinc-800">
                  {media.artistes.photo_url ? (
                    <img
                      src={media.artistes.photo_url}
                      alt={media.artistes.nom}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      Aucun visuel
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold">{media.artistes.nom}</h3>

                  <p className="mt-1 text-zinc-500">
                    {media.artistes.style || "Style non renseigné"}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun artiste lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Projet lié</h2>

            {media.projets ? (
              <Link
                href={`/projets/${media.projets.id}`}
                className="mt-6 block rounded-2xl border border-zinc-800 bg-black p-5 hover:border-zinc-600"
              >
                <p className="text-sm text-zinc-500">
                  {media.projets.type || "Projet"}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {media.projets.titre}
                </h3>

                <p className="mt-2 text-zinc-500">
                  {media.projets.statut || "Statut non renseigné"}
                </p>
              </Link>
            ) : (
              <p className="mt-5 text-zinc-500">Aucun projet lié.</p>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions</h2>

            <div className="mt-6 space-y-3">
              {media.email && (
                <a
                  href={`mailto:${media.email}`}
                  className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
                >
                  Envoyer un email
                </a>
              )}

              {media.instagram && (
                <a
                  href={`https://instagram.com/${media.instagram.replace("@", "")}`}
                  target="_blank"
                  className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
                >
                  Ouvrir Instagram
                </a>
              )}

              <Link
                href="/medias"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Retour pipeline
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}