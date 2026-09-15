import { notFound } from "next/navigation";
import TeamMemberEditForm from "@/components/TeamMemberEditForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: member }, { data: artists }] = await Promise.all([
    supabase.from("profiles").select("id, nom, email, role, artiste_id").eq("id", id).maybeSingle(),
    supabase.from("artistes").select("id, nom").order("nom"),
  ]);
  if (!member) notFound();

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-3xl"><header className="mb-8 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Administration · Équipe</p><h1 className="mt-3 text-4xl font-bold md:text-5xl">Modifier un membre</h1><p className="mt-3 text-zinc-400">{member.email || "Compte sans e-mail renseigné"}</p></header><TeamMemberEditForm member={member} artists={artists || []} actorId={actor.id} actorRole={actor.role} /></div></main>;
}
