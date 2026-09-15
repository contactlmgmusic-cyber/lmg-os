import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { requireRole } from "@/lib/require-role.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const editorRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARTISTIC_DIRECTOR] as const;

export default async function ModifierTachePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole(editorRoles);
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: task } = await supabase.from("taches").select("*").eq("id", id).maybeSingle();
  if (!task) redirect("/taches");

  const isAdmin = profile.role === ROLES.SUPER_ADMIN || profile.role === ROLES.ADMIN;
  if (!isAdmin && task.created_by !== profile.id) redirect(`/taches/${id}`);

  let profilesQuery = supabase.from("profiles").select("id, nom, full_name, role, artiste_id").order("nom");
  const [{ data: profiles }, { data: assignees }] = await Promise.all([
    profilesQuery,
    supabase.from("task_assignees").select("user_id").eq("task_id", id),
  ]);
  const selected = new Set((assignees || []).map((item) => item.user_id));
  if (task.responsable_id) selected.add(task.responsable_id);

  async function updateTask(formData: FormData) {
    "use server";
    const actionProfile = await requireRole(editorRoles);
    const actionSupabase = await createAuthenticatedSupabaseClient();
    const { data: currentTask } = await actionSupabase.from("taches").select("id, created_by").eq("id", id).maybeSingle();
    const actionIsAdmin = actionProfile.role === ROLES.SUPER_ADMIN || actionProfile.role === ROLES.ADMIN;
    if (!currentTask || (!actionIsAdmin && currentTask.created_by !== actionProfile.id)) throw new Error("Modification non autorisée.");

    const responsibleId = String(formData.get("responsable_id") || "").trim();
    const participantIds = Array.from(new Set([
      ...formData.getAll("participant_ids").map(String).filter(Boolean),
      ...(responsibleId ? [responsibleId] : []),
    ]));
    const { error } = await actionSupabase.from("taches").update({
      titre: String(formData.get("titre") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      statut: String(formData.get("statut") || "À faire"),
      priorite: String(formData.get("priorite") || "Moyenne"),
      deadline: formData.get("deadline") || null,
      responsable_id: responsibleId || null,
      assigned_to: responsibleId || null,
    }).eq("id", id);
    if (error) throw error;
    const { error: deleteError } = await actionSupabase.from("task_assignees").delete().eq("task_id", id);
    if (deleteError) throw deleteError;
    if (participantIds.length) {
      const { error: assignmentError } = await actionSupabase.from("task_assignees").insert(participantIds.map((userId) => ({ task_id: id, user_id: userId })));
      if (assignmentError) throw assignmentError;
    }
    revalidatePath("/taches");
    revalidatePath(`/taches/${id}`);
    redirect(`/taches/${id}`);
  }

  const deadline = task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "";
  const fieldClass = "mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-zinc-600";
  return <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10"><div className="mx-auto max-w-5xl">
    <Link href={`/taches/${id}`} className="text-sm text-zinc-500 hover:text-white">← Retour à la tâche</Link>
    <header className="mt-6 border-b border-zinc-900 pb-8"><p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">Action concernée</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Modifier la tâche</h1><p className="mt-3 text-zinc-500">Seuls le créateur et les administrateurs peuvent changer le contenu ou les personnes concernées.</p></header>
    <form action={updateTask} className="mt-8 space-y-6 rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 md:p-8">
      <label className="block text-sm text-zinc-400">Titre<input name="titre" defaultValue={task.titre || ""} required className={fieldClass} /></label>
      <label className="block text-sm text-zinc-400">Description<textarea name="description" defaultValue={task.description || ""} rows={5} className={fieldClass} /></label>
      <div className="grid gap-5 md:grid-cols-3">
        <label className="block text-sm text-zinc-400">Statut<select name="statut" defaultValue={task.statut || "À faire"} className={fieldClass}><option>À faire</option><option>En cours</option><option>Terminé</option></select></label>
        <label className="block text-sm text-zinc-400">Priorité<select name="priorite" defaultValue={task.priorite || "Moyenne"} className={fieldClass}><option>Basse</option><option>Moyenne</option><option>Haute</option><option>Urgente</option></select></label>
        <label className="block text-sm text-zinc-400">Échéance<input type="date" name="deadline" defaultValue={deadline} className={fieldClass} /></label>
      </div>
      <label className="block text-sm text-zinc-400">Responsable principal<select name="responsable_id" defaultValue={task.responsable_id || ""} className={fieldClass}><option value="">Non assigné</option>{(profiles || []).map((person) => <option key={person.id} value={person.id}>{person.nom || person.full_name || "Membre LMG"} — {person.role}</option>)}</select></label>
      <section className="rounded-2xl border border-zinc-800 bg-black p-5"><h2 className="font-semibold">Participants concernés</h2><p className="mt-1 text-sm text-zinc-600">La tâche apparaîtra uniquement chez ces personnes, son créateur et les administrateurs.</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(profiles || []).map((person) => <label key={person.id} className="flex items-center gap-3 rounded-xl border border-zinc-900 p-4 text-sm"><input type="checkbox" name="participant_ids" value={person.id} defaultChecked={selected.has(person.id)} className="h-4 w-4 accent-white" /><span className="min-w-0"><span className="block truncate font-medium">{person.nom || person.full_name || "Membre LMG"}</span><span className="text-xs text-zinc-600">{person.role}</span></span></label>)}</div></section>
      <div className="flex justify-end gap-3"><Link href={`/taches/${id}`} className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300">Annuler</Link><button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Enregistrer</button></div>
    </form>
  </div></main>;
}
