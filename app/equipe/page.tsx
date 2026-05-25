import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { canManageTeam } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const { data: members, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/login");
}

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (!canManageTeam(profile?.role)) {
  redirect("/");
}

  if (error) {
    return (
      <main className="p-10 text-white">
        <p className="text-red-400">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Team
        </p>

        <h1 className="text-5xl font-bold">
          Équipe LMG
        </h1>

        <p className="mt-3 text-zinc-400">
          Gestion des membres, rôles et accès.
        </p>
      </div>

      {(!members || members.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
          Aucun membre trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members?.map((member: any) => (
          <div
            key={member.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-2xl font-bold">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.nom || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  member.nom?.charAt(0)?.toUpperCase() || "L"
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {member.nom || "Membre"}
                </h2>

                <p className="mt-1 text-zinc-500">
                  {member.email || "Email non renseigné"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                {member.role || "member"}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/equipe/${member.id}/modifier`}
                className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}