import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import {
  getRoleHome,
  isUserRole,
  type UserRole,
} from "@/lib/roles";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabaseAuth
    .from("profiles")
    .select("id, role, artiste_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!isUserRole(profile?.role)) {
    redirect("/");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect(getRoleHome(profile.role));
  }

  return profile;
}
