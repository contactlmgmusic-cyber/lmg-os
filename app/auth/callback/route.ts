import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const response = NextResponse.redirect(new URL("/reset-password", request.url));
  if (code) {
    const db = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll: () => request.cookies.getAll(), setAll: items => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) },
    });
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }
  return NextResponse.redirect(new URL("/forgot-password?erreur=lien", request.url));
}
