import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
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
        .select("*")
        .eq("id", user.id)
        .single()
    : { data: null };

  if (
    currentProfile?.role !== "manager" &&
    currentProfile?.role !== "admin"
  ) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          Accès refusé.
        </p>
      </main>
    );
  }

  let artistesQuery = supabase
    .from("artistes")
    .select("*")
    .order("created_at", { ascending: false });

  if (currentProfile?.role === "manager") {
    artistesQuery = artistesQuery.eq(
      "manager_id",
      user?.id
    );
  }

  const { data: artistes }: any =
    await artistesQuery;

  const artisteIds =
    artistes?.map((a: any) => a.id) || [];

  const { data: projets }: any =
    artisteIds.length > 0
      ? await supabase
          .from("projets")
          .select("*")
          .in("artiste_id", artisteIds)
          .order("created_at", {
            ascending: false,
          })
      : { data: [] };

  const projetIds =
    projets?.map((p: any) => p.id) || [];

  const { data: taches }: any =
    projetIds.length > 0
      ? await supabase
          .from("taches")
          .select("*")
          .in("projet_id", projetIds)
          .order("created_at", {
            ascending: false,
          })
      : { data: [] };

  const urgentTasks =
    taches?.filter(
      (t: any) =>
        t.priorite === "Haute" &&
        t.statut !== "Terminé"
    ) || [];

  const upcomingProjects =
    projets?.filter(
      (p: any) =>
        p.date_sortie &&
        new Date(p.date_sortie) >= new Date()
    ) || [];

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Workspace
        </p>

        <h1 className="text-5xl font-bold">
          Dashboard Manager
        </h1>

        <p className="mt-3 text-zinc-400">
          Pilotage de tes artistes,
          projets et opérations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Artistes
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            {artistes?.length || 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Projets
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            {projets?.length || 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Tâches urgentes
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            {urgentTasks.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">
            Sorties à venir
          </p>

          <h2 className="mt-3 text-5xl font-bold">
            {upcomingProjects.length}
          </h2>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Mes artistes
            </h2>

            <Link
              href="/artistes"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Voir tout →
            </Link>
          </div>

          <div className="space-y-4">
            {artistes?.map((artiste: any) => (
              <Link
                key={artiste.id}
                href={`/artistes/${artiste.id}`}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600"
              >
                <div className="h-14 w-14 overflow-hidden rounded-full bg-zinc-800">
                  {artiste.photo_url ? (
                    <img
                      src={artiste.photo_url}
                      alt={artiste.nom}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div>
                  <p className="text-lg font-semibold">
                    {artiste.nom}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {artiste.style ||
                      "Style non renseigné"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Tâches urgentes
            </h2>

            <Link
              href="/taches"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Voir tout →
            </Link>
          </div>

          <div className="space-y-4">
            {urgentTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/taches/${task.id}`}
                className="block rounded-2xl border border-red-500/30 bg-red-500/5 p-5 transition hover:border-red-500/60"
              >
                <p className="text-sm text-red-300">
                  Priorité haute
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {task.titre}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {task.deadline ||
                    "Pas de deadline"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}