import CareersApplicationsWorkspace from "@/components/careers-admin/CareersApplicationsWorkspace";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
const departments: Record<string, string> = { music: "Music", creative: "Creative", business: "Business", tech_digital: "Tech & Digital", multiple: "Plusieurs pôles" };

export default async function SpontaneousApplicationsPage() {
  await requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data, error } = await supabase.from("careers_applications").select("id, first_name, last_name, email, status, created_at, assigned_to, next_action, next_action_at, archived_at, department_interest").eq("application_type", "spontaneous").is("archived_at", null).order("created_at", { ascending: false });
  const ids = [...new Set((data || []).map((item) => item.assigned_to).filter(Boolean))] as string[];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, nom, email").in("id", ids) : { data: [] };
  const names = new Map((profiles || []).map((person) => [person.id, person.nom || person.email]));
  const applications = (data || []).map((item) => ({ ...item, assignee_name: item.assigned_to ? names.get(item.assigned_to) || "Équipe LMG" : null, opportunity: "Candidature spontanée", department: departments[item.department_interest || ""] || "Non précisé" }));
  return <main className="space-y-6 pb-10">
    <header className="rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">LMG Careers</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Candidatures spontanées</h1><p className="mt-2 text-sm text-zinc-400">Explorez et pilotez les profils reçus en dehors d’une offre publiée.</p></header>
    {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">Impossible de charger les candidatures : {error.message}</p> : <CareersApplicationsWorkspace applications={applications} />}
  </main>;
}
