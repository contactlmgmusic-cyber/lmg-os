import NewTaskForm from "@/components/NewTaskForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NouvelleTachePage() {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR, ROLES.MANAGER]);
  const supabase = await createAuthenticatedSupabaseClient();
  const isAdmin = profile.role === ROLES.SUPER_ADMIN || profile.role === ROLES.ADMIN;
  const isManager = profile.role === ROLES.MANAGER;

  let profilesQuery = supabase.from("profiles").select("id, nom, role, artiste_id").order("nom");
  let projectsQuery = supabase.from("projets").select("id, titre, artiste_id").order("titre");

  if (isManager) {
    const { data: managedArtists } = await supabase.from("artistes").select("id").eq("manager_id", profile.id);
    const artistIds = (managedArtists || []).map((artist: any) => artist.id);
    profilesQuery = profilesQuery.or(`id.eq.${profile.id}${artistIds.length ? `,artiste_id.in.(${artistIds.join(",")})` : ""}`);
    projectsQuery = artistIds.length ? projectsQuery.in("artiste_id", artistIds) : projectsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const [{ data: profiles }, { data: projets }, internalResult] = await Promise.all([
    profilesQuery,
    projectsQuery,
    isAdmin || profile.role === ROLES.ARTISTIC_DIRECTOR
      ? supabase.from("internal_projects").select("id, titre").not("statut", "in", '("Terminé","Archivé")').order("titre")
      : Promise.resolve({ data: [] }),
  ]);

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1200px]"><header className="border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Travail ciblé</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Nouvelle tâche</h1><p className="mt-3 text-zinc-500">Assigne une action uniquement aux personnes et projets de ton périmètre.</p></header><div className="mt-8"><NewTaskForm profiles={(profiles || []).map(({ id, nom }: any) => ({ id, nom }))} projets={projets || []} internalProjects={internalResult.data || []} /></div></div></main>;
}
