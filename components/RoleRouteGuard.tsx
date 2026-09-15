import { requireRole } from "@/lib/require-role.server";
import type { UserRole } from "@/lib/roles";

export default async function RoleRouteGuard({ roles, children }: { roles: readonly UserRole[]; children: React.ReactNode }) {
  await requireRole(roles);
  return children;
}
