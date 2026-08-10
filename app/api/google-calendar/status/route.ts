import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL as string,
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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

  if (!user) {
    return NextResponse.json(
      {
        connected: false,
      },
      {
        status: 401,
      }
    );
  }

  const supabaseAdmin = createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL as string,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: connection } =
    await supabaseAdmin
      .from("google_calendar_connections")
      .select("id, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

  return NextResponse.json({
    connected: Boolean(connection),
    updatedAt:
      connection?.updated_at || null,
  });
}