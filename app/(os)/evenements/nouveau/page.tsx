import InternalEventForm from "@/components/InternalEventForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
export const dynamic = "force-dynamic";
export default async function NewInternalEventPage() { await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR]); const supabase = await createAuthenticatedSupabaseClient(); const { data: profiles } = await supabase.from("profiles").select("id,nom,full_name").in("role", ["super_admin","admin","manager","artistic_director"]).eq("actif", true).order("nom"); return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500">Agenda interne</p><h1 className="mt-3 text-4xl font-black">Nouvel événement</h1><div className="mt-8 rounded-[26px] border border-zinc-800 bg-zinc-950 p-6"><InternalEventForm profiles={profiles || []} /></div></div></main>; }
