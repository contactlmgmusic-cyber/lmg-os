import { requireRole } from "@/lib/require-role.server";
import { EXECUTIVE_ROLES } from "@/lib/roles";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import PortalWorkspace from "@/components/PortalWorkspace";
import type { PortalEntry } from "@/lib/portal/content";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireRole(EXECUTIVE_ROLES);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data, error } = await supabase.from("portal_content").select("*").order("updated_at", { ascending: false });
  const { data: media } = error ? { data: [] } : await supabase.storage.from("portal-media").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  const mediaUrls = (media || []).filter(item => item.id).map(item => ({name:item.name,url:supabase.storage.from("portal-media").getPublicUrl(item.name).data.publicUrl}));
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-widest text-yellow-500">Administration / Site du groupe</p><h1 className="mt-4 text-4xl font-bold">Portail LMG Group</h1><p className="mt-4 text-zinc-400">Actualités, projets et visuels du portail public.</p>{error ? <div role="alert" className="mt-8 rounded-xl border border-amber-700 bg-amber-950/30 p-6">Le module n’est pas disponible. Vérifiez la connexion, les droits et l’application de la migration <code>20260927000100_group_portal.sql</code> dans le projet Supabase LMG OS.</div> : <PortalWorkspace initialMedia={mediaUrls} initialEntries={(data || []) as PortalEntry[]} />}</div></main>;
}
