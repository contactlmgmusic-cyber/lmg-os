import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, nom, role")
    .order("role");

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const usersCount = profiles?.length || 0;
  const superAdmins = profiles?.filter((p: any) => p.role === ROLES.SUPER_ADMIN).length || 0;
  const managers = profiles?.filter((p: any) => p.role === ROLES.MANAGER).length || 0;
  const artistes = profiles?.filter((p: any) => p.role === ROLES.ARTISTE).length || 0;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          LMG Admin
        </p>

        <h1 className="text-5xl font-bold">Administration</h1>

        <p className="mt-3 text-zinc-400">
          Gestion des utilisateurs, rôles, invitations et accès LMG OS.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card label="Utilisateurs" value={usersCount} />
        <Card label="Super Admins" value={superAdmins} />
        <Card label="Managers" value={managers} />
        <Card label="Artistes" value={artistes} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-6 text-3xl font-bold">Utilisateurs</h2>

          {(!profiles || profiles.length === 0) && (
            <p className="text-zinc-500">Aucun utilisateur trouvé.</p>
          )}

          <div className="space-y-4">
            {profiles?.map((profile: any) => (
              <div
                key={profile.id}
                className="rounded-2xl border border-zinc-800 bg-black p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profile.nom || profile.email || "Utilisateur"}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {profile.email || "Email non renseigné"}
                    </p>
                  </div>

                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    {profile.role || "Aucun rôle"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-3xl font-bold">Actions admin</h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/invitations"
                className="block rounded-xl bg-white px-5 py-4 text-center font-medium text-black hover:bg-zinc-200"
              >
                Gérer invitations
              </Link>

              <Link
                href="/equipe"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Voir équipe
              </Link>

              <Link
                href="/"
                className="block rounded-xl border border-zinc-700 px-5 py-4 text-center text-zinc-300 hover:bg-zinc-800"
              >
                Retour cockpit CEO
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 text-3xl font-bold">Invitations récentes</h2>

            {(!invitations || invitations.length === 0) && (
              <p className="text-zinc-500">Aucune invitation récente.</p>
            )}

            <div className="space-y-4">
              {invitations?.map((invitation: any) => (
                <div
                  key={invitation.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <p className="font-semibold">
                    {invitation.email || "Email non renseigné"}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {invitation.role || "Rôle non renseigné"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <h2 className="mt-3 text-5xl font-bold">{value}</h2>
    </div>
  );
}