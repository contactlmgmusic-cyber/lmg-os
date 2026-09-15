import SiteArtistsManager from "@/components/SiteArtistsManager";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function SiteArtistsPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  return <SiteArtistsManager />;
}

