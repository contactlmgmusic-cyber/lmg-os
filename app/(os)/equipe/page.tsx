import Link from "next/link";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import RoleBadge from "@/components/RoleBadge";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, nom, email, role, avatar_url, created_at")
    .order("created_at", { ascending: false });

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
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1500px]">
      <div className="mb-10 flex flex-col gap-5 border-b border-zinc-900 pb-8 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">LMG Team</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Équipe LMG</h1><p className="mt-3 text-zinc-400">Membres, responsabilités et niveaux d’accès.</p></div><Link href="/invitations" className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black">Inviter un membre</Link></div>

      {(!members || members.length === 0) && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
          Aucun membre trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {members?.map((member: any) => (
          <div
            key={member.id}
            className="rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"
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
              <RoleBadge role={member.role} />
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
    </div></main>
  );
}
