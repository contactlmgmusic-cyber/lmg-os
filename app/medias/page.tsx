import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MediaKanban from "@/components/MediaKanban";

export const dynamic = "force-dynamic";

export default async function MediasPage() {
  const { data: medias, error } = await supabase
    .from("medias")
    .select(`
      *,
      artistes (
        nom
      ),
      projets (
        titre
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">Erreur : {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">CRM Médias</h1>
          <p className="mt-2 text-zinc-400">
            Playlists, radios, blogs, journalistes et influenceurs.
          </p>
        </div>

        <Link
          href="/medias/nouveau"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
        >
          + Nouveau contact
        </Link>
      </div>

      <MediaKanban medias={medias || []} />
    </main>
  );
}