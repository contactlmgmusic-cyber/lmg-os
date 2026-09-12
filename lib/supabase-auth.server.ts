import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase client scoped to the current user's session (never a service role). */
export async function createAuthenticatedSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}
