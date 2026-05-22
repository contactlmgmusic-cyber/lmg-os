import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

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
          LMG Team
        </p>

        <h1 className="text-5xl font-bold">Équipe</h1>

        <p className="mt-3 text-zinc-400">
          Membres, rôles et futurs responsables des tâches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {profiles?.map((profile) => (
          <div
            key={profile.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-2xl font-bold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.nom?.charAt(0)?.toUpperCase() || "L"
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {profile.nom || "Membre LMG"}
                </h2>

                <p className="text-sm text-zinc-500">
                  {profile.role || "member"}
                </p>
              </div>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              Actif
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}