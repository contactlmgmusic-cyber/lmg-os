import { requireRole } from "@/lib/require-role.server";
import { EXECUTIVE_ROLES } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(EXECUTIVE_ROLES);

  return children;
}
