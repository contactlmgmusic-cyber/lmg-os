import type { Metadata, Viewport } from "next";

import MobileAdminShell from "@/components/mobile-admin/MobileAdminShell";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";

export const metadata: Metadata = {
  title: "LMG Admin",
  description: "Le poste de pilotage mobile du staff LMG Music.",
  robots: { index: false, follow: false },
  manifest: "/mobile/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LMG Admin",
  },
  icons: {
    apple: "/logo-lmg-v2.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.ARTISTIC_DIRECTOR,
] as const;

export default async function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(STAFF_ROLES);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: staffProfile } = await supabase
    .from("profiles")
    .select("nom, full_name")
    .eq("id", profile.id)
    .maybeSingle();

  return (
    <MobileAdminShell
      userName={staffProfile?.nom || staffProfile?.full_name || "Staff LMG"}
      userRole={profile.role}
    >
      {children}
    </MobileAdminShell>
  );
}
