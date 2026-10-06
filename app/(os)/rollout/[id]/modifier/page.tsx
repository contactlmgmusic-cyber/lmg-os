import { notFound } from "next/navigation";
import RolloutEventForm from "@/components/RolloutEventForm";
import { requireRole } from "@/lib/require-role.server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";
export default async function EditRolloutPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR]);
  const { id } = await params;
  const db = await createAuthenticatedSupabaseClient();
  const { data } = await db.from("rollout_events").select("id,titre,type,statut,date_event,notes,projet_id").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <RolloutEventForm event={data} />;
}
