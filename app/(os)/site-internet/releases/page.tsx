import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

import SiteReleasesManager from "@/components/SiteReleasesManager";

export const dynamic = "force-dynamic";

export default async function SiteInternetReleasesPage() {
  await requireRole([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  return <SiteReleasesManager />;
}