import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import SiteNewsManager from "@/components/SiteNewsManager";

export const dynamic = "force-dynamic";

export default async function SiteInternetNewsPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return <SiteNewsManager />;
}
