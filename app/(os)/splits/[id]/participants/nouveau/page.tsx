import Link from "next/link";
import { notFound } from "next/navigation";
import SplitParticipantForm from "@/components/SplitParticipantForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NouveauParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: split, error } = await supabase.from("splits").select("id, titre, projets(id, titre), split_participants(id, pourcentage), royalties(id)").eq("id", id).single();
  if (error || !split) notFound();
  const participants = split.split_participants || [];
  const currentTotal = participants.reduce((sum: number, item: any) => sum + Number(item.pourcentage || 0), 0);
  const locked = (split.royalties || []).length > 0;
  const project: any = Array.isArray(split.projets) ? split.projets[0] : split.projets;

  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-[1100px]">
    <Link href={`/splits/${split.id}`} className="text-sm font-semibold text-zinc-500 hover:text-white">← Retour au split</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Répartition des droits</p><h1 className="mt-3 text-4xl font-bold md:text-6xl">Ajouter un participant</h1><p className="mt-3 text-zinc-500">{split.titre} · {project?.titre || "Projet non lié"}</p></header>
    {locked ? <section className="mt-8 rounded-[26px] border border-yellow-500/20 bg-yellow-500/[0.05] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Split verrouillé</p><h2 className="mt-2 text-2xl font-bold">Les royalties ont déjà été générées</h2><p className="mt-3 text-sm leading-6 text-zinc-500">La répartition ne peut plus recevoir de participant, afin de préserver la cohérence entre le split et les royalties existantes.</p><Link href={`/splits/${split.id}`} className="mt-5 inline-block text-sm font-bold text-white">Retour à la fiche →</Link></section> : <SplitParticipantForm splitId={split.id} splitTitle={split.titre} currentTotal={currentTotal} participantCount={participants.length} />}
  </div></main>;
}
