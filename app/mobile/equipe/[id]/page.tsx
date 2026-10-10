import Link from "next/link";
import { notFound } from "next/navigation";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = { super_admin: "Direction", admin: "Administration", manager: "Management", artistic_director: "Direction artistique" };

export default async function MobileMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: member } = await supabase.from("profiles").select("id, nom, full_name, email, role, poste, avatar_url, created_at").eq("id", id).maybeSingle();
  if (!member || !roleLabels[member.role]) notFound();

  const name = member.nom || member.full_name || "Membre LMG";
  const initials = name.split(" ").filter(Boolean).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const avatar = member.avatar_url || "";

  return <div className="px-5 py-6"><Link href="/mobile/equipe" className="text-xs font-bold text-zinc-600">‹ Retour à l’équipe</Link><section className="mt-5 rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-6 text-center"><div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-[26px] border border-white/10 bg-black text-2xl font-black text-[#f2b705]" style={avatar ? { backgroundImage: `url(${avatar})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{avatar ? <span className="sr-only">Photo de {name}</span> : initials}</div><h1 className="mt-5 text-2xl font-black">{name}</h1><p className="mt-2 text-sm text-zinc-500">{member.poste || roleLabels[member.role]}</p><span className="mt-4 inline-flex rounded-full bg-[#f2b705]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f2b705]">{roleLabels[member.role]}</span></section><div className="mt-5 grid grid-cols-2 gap-3"><Link href="/mobile/messages/prives" className="rounded-[20px] bg-[#f2b705] p-5 text-black"><p className="text-xl font-black">↗</p><p className="mt-7 text-sm font-black">Écrire</p><p className="mt-1 text-[10px] font-semibold text-black/60">Message privé</p></Link>{member.email ? <a href={`mailto:${member.email}`} className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-5"><p className="text-xl font-black text-[#f2b705]">@</p><p className="mt-7 text-sm font-black">E-mail</p><p className="mt-1 truncate text-[10px] text-zinc-600">{member.email}</p></a> : <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.015] p-5 text-zinc-700"><p className="text-xl font-black">@</p><p className="mt-7 text-sm font-black">E-mail indisponible</p></div>}</div></div>;
}
