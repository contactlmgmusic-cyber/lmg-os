import { NextResponse } from "next/server";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { getOrCreatePushSecrets } from "@/lib/push-secrets.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { publicKey } = await getOrCreatePushSecrets();
    return NextResponse.json({ publicKey });
  } catch (failure) {
    return NextResponse.json({ error: failure instanceof Error ? failure.message : "Configuration impossible" }, { status: 500 });
  }
}

