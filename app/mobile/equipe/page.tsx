import Link from "next/link";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = { super_admin: "Direction", admin: "Administration", manager: "Management", artistic_director: "Direction artistique" };

export default async function MobileTeamPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: profiles } = await supabase.from("profiles").select("id, nom, full_name, role, poste, actif").in("role", ["super_admin", "admin", "manager", "artistic_director"]).eq("actif", true).order("nom", { ascending: true });

  return <div className="px-5 py-6"><header><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Communication</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Équipe</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Retrouve le staff et poursuis les échanges internes.</p></header>
    <div className="mt-6 grid grid-cols-2 gap-3"><Link href="/chat" className="rounded-[22px] bg-[#f2b705] p-5 text-black"><p className="text-2xl font-black">↗</p><p className="mt-8 text-sm font-black">Chat d’équipe</p><p className="mt-1 text-[11px] font-semibold text-black/60">Canaux LMG en direct</p></Link><Link href="/chat/prive" className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-5"><p className="text-2xl font-black text-[#f2b705]">→</p><p className="mt-8 text-sm font-black">Messages privés</p><p className="mt-1 text-[11px] text-zinc-600">Discussions individuelles</p></Link></div>
    <section className="mt-8"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f2b705]">Staff actif</p><div className="mt-3 rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4">{profiles?.map((profile: any) => { const name = profile.nom || profile.full_name || "Membre LMG"; return <Link href={`/mobile/equipe/${profile.id}`} key={profile.id} className="flex items-center gap-3 border-b border-white/[0.06] py-4 last:border-0"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-black text-[#f2b705]">{initials(name)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{name}</p><p className="mt-1 truncate text-xs text-zinc-600">{profile.poste || roleLabels[profile.role] || "Équipe LMG"}</p></div><span className="text-zinc-700">›</span></Link>; })}</div></section>
  </div>;
}

function initials(name: string) { return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
