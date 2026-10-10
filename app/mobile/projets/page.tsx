import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

export default async function MobileProjectsPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: projects } = await supabase
    .from("internal_projects")
    .select("id, titre, pole, categorie, statut, priorite, objectif, progression, deadline")
    .not("statut", "in", '("Terminé","Archivé")')
    .order("deadline", { ascending: true, nullsFirst: false });

  return <div className="px-5 py-6"><PageTitle eyebrow="Pilotage" title="Projets" description="L’avancement des chantiers importants de LMG." />
    <div className="mt-6 space-y-3">{projects?.length ? projects.map((project: any) => <Link key={project.id} href={`/mobile/projets/${project.id}`} className="block rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">{project.pole || "LMG"}</p><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${project.priorite === "Urgente" || project.priorite === "Haute" ? "bg-red-500/10 text-red-400" : "bg-zinc-900 text-zinc-500"}`}>{project.priorite || "Normale"}</span></div><h2 className="mt-4 text-lg font-black">{project.titre}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{project.objectif || project.categorie || "Projet LMG"}</p><div className="mt-5 flex items-center gap-3"><div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-900"><div className="h-full bg-[#f2b705]" style={{ width: `${Math.min(100, Number(project.progression || 0))}%` }} /></div><span className="text-[10px] font-bold text-zinc-600">{project.progression || 0}%</span></div></Link>) : <Empty text="Aucun projet actif." />}</div>
  </div>;
}

function PageTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">{title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p></header>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center text-sm text-zinc-600">{text}</div>; }
