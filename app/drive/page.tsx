import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getAssetPreview(asset: any) {
  const type = asset.type || "";

  if (type.startsWith("image/")) {
    return (
      <img
        src={asset.url}
        alt={asset.nom}
        className="h-56 w-full rounded-2xl object-cover"
      />
    );
  }

  if (type.startsWith("audio/")) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
        <p className="mb-3 text-sm text-zinc-500">Audio</p>
        <audio controls className="w-full">
          <source src={asset.url} type={type} />
        </audio>
      </div>
    );
  }

  if (type.startsWith("video/")) {
    return (
      <video
        controls
        className="h-56 w-full rounded-2xl object-cover"
      >
        <source src={asset.url} type={type} />
      </video>
    );
  }

  if (type === "application/pdf") {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500">
        PDF Document
      </div>
    );
  }

  return (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-500">
      Fichier
    </div>
  );
}

export default async function DrivePage() {
const cookieStore = await cookies();

const supabaseAuth = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  }
);

const {
  data: { user },
} = await supabaseAuth.auth.getUser();

const { data: currentProfile } = user
  ? await supabase
      .from("profiles")
      .select("role, artiste_id")
      .eq("id", user.id)
      .single()
  : { data: null };

let assetsQuery = supabase
  .from("assets")
  .select(`
    *,
    projets (
      id,
      titre,
      artiste_id,
      artistes (
        id,
        manager_id
      )
    ),
    taches (
      id,
      titre
    )
  `)
  .order("created_at", { ascending: false });

if (currentProfile?.role === "manager") {
  assetsQuery = assetsQuery.eq(
    "projets.artistes.manager_id",
    user?.id
  );
}

if (currentProfile?.role === "artist") {
  assetsQuery = assetsQuery.eq(
    "projets.artiste_id",
    currentProfile.artiste_id
  );
}

const { data: assets, error } = await assetsQuery;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Drive
        </p>

        <h1 className="text-5xl font-bold">Assets</h1>

        <p className="mt-3 text-zinc-400">
          Tous les fichiers uploadés sur les projets et tâches.
        </p>
      </div>

      {(!assets || assets.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
          Aucun fichier uploadé pour le moment.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {assets?.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
          >
            {getAssetPreview(asset)}

            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                {asset.type || "Fichier"}
              </p>

              <h2 className="mt-2 truncate text-xl font-bold">
                {asset.nom}
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Projet : {asset.projets?.titre || "Non lié"}
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Tâche : {asset.taches?.titre || "Non liée"}
              </p>

              <a
                href={asset.url}
                target="_blank"
                className="mt-5 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black hover:bg-zinc-200"
              >
                Ouvrir
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}