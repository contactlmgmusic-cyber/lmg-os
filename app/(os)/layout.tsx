import { requireRole } from "@/lib/require-role.server";
import { INTERNAL_ROLES } from "@/lib/roles";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };

import AppShell from "@/components/AppShell";

export default async function OSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(INTERNAL_ROLES);
  return <AppShell>{children}</AppShell>;
}