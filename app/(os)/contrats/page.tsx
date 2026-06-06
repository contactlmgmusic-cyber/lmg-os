import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ContratsPage() {
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

  let query = supabase
    .from("contrats")
    .select(`
      *,
      artistes (
        id,
        nom,
        manager_id
      ),
      projets (
        id,
        titre
      )
    `)
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "manager") {
    query = query.eq("artistes.manager_id", user?.id);
  }

  if (currentProfile?.role === "artiste" && currentProfile?.artiste_id) {
    query = query.eq("artiste_id", currentProfile.artiste_id);
  }

  if (currentProfile?.role === "prestataire") {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: contrats, error } = await query;

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">{error.message}</p>
      </main>
    );
  }

  const canCreateContract =
    currentProfile?.role === "super_admin" ||
    currentProfile?.role === "admin" ||
    currentProfile?.role === "manager";

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            LMG Legal
          </p>

          <h1 className="text-5xl font-bold">Contrats</h1>

          <p className="mt-3 text-zinc-400">
            {currentProfile?.role === "manager"
              ? "Contrats de mes artistes"
              : currentProfile?.role === "artiste"
              ? "Mes contrats"
              : "Contrats artistes, booking, prestations et split sheets."}
          </p>
        </div>

        {canCreateContract && (
          <Link
            href="/contrats/nouveau"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            + Nouveau contrat
          </Link>
        )}
      </div>

      {(!contrats || contrats.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Aucun contrat ajouté.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {contrats?.map((contrat: any) => (
          <div
            key={contrat.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">{contrat.type}</p>

                <h2 className="mt-2 text-2xl font-bold">
                  {contrat.titre}
                </h2>
              </div>

              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                {contrat.statut || "Brouillon"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-zinc-400">
              <p>Artiste : {contrat.artistes?.nom || "Non lié"}</p>
              <p>Projet : {contrat.projets?.titre || "Non lié"}</p>
            </div>

            {contrat.notes && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                {contrat.notes}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              {contrat.fichier_url && (
                <a
                  href={contrat.fichier_url}
                  target="_blank"
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-black"
                >
                  Ouvrir PDF
                </a>
              )}

              <Link
                href={`/contrats/${contrat.id}`}
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Détail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}