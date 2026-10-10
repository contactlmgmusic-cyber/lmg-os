import { notFound } from "next/navigation";

import InternalEventForm, { type InternalEventInitial } from "@/components/InternalEventForm";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function MobileEditInternalEventPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR]); const { id } = await params;
  const supabase = await createAuthenticatedSupabaseClient();
  const [{ data: event }, { data: profiles }] = await Promise.all([supabase.from("internal_events").select("*").eq("id", id).maybeSingle(), supabase.from("profiles").select("id,nom,full_name").in("role", ["super_admin", "admin", "manager", "artistic_director"]).eq("actif", true).order("nom")]);
  if (!event || (event.created_by !== profile.id && ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(profile.role as any))) notFound();
  return <div className="px-5 py-6"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f2b705]">Agenda interne</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Modifier</h1><div className="mt-6"><InternalEventForm profiles={profiles || []} initial={event as InternalEventInitial} mobile /></div></div>;
}
