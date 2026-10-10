import InternalEventForm from "@/components/InternalEventForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MobileNewInternalEventPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,nom,full_name")
    .in("role", ["super_admin", "admin", "manager", "artistic_director"])
    .eq("actif", true)
    .order("nom");

  return <div className="px-5 py-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Agenda interne</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Nouvel événement</h1><p className="mt-2 text-sm leading-6 text-zinc-500">Réunion, rendez-vous, session ou temps fort de l’équipe.</p><div className="mt-6"><InternalEventForm profiles={profiles || []} mobile /></div></div>;
}
