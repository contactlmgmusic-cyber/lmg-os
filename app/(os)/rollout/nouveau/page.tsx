import RolloutEventForm from "@/components/RolloutEventForm";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
export default async function NewRolloutPage({ searchParams }: { searchParams: Promise<{ projet_id?: string }> }) {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR]);
  const { projet_id } = await searchParams;
  return <RolloutEventForm initialProjectId={projet_id || ""} />;
}
