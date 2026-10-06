import "server-only";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";
import { calendarDateKey } from "@/lib/calendar-dates";
export type CalendarItem = { id: string; type: string; category: string; titre: string; date: string; statut?: string | null; link: string; description?: string | null };
type Profile = { id: string; role: string; artiste_id?: string | null };
export async function loadCalendar(profile: Profile) {
  const db = await createAuthenticatedSupabaseClient();
  const admin = profile.role === ROLES.SUPER_ADMIN || profile.role === ROLES.ADMIN;
  const staff = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR].includes(profile.role as any);
  const artistAccess = staff || profile.role === ROLES.ARTISTE;
  const sources: { label: string; query: PromiseLike<{ data: any[] | null; error: { code?: string; message?: string } | null }>; map: (row: any) => CalendarItem[] }[] = [];
  const entry = (source: string, row: any, title: string, date: string, type: string, category: string, link: string): CalendarItem => ({ id: `${source}-${row.id}`, titre: title, date: calendarDateKey(date), type, category, link, statut: row.statut });
  sources.push({ label: "Tâches", query: db.from("taches").select("id,titre,deadline,statut,responsable_id,assigned_to,created_by,task_assignees(user_id)").not("deadline", "is", null), map: row => {
    const assigned = row.responsable_id === profile.id || row.assigned_to === profile.id || row.task_assignees?.some((item: any) => item.user_id === profile.id);
    return admin || assigned || (profile.role === ROLES.ARTISTIC_DIRECTOR && row.created_by === profile.id) ? [entry("task", row, row.titre, row.deadline, "Tâche", "Tâche", `/taches/${row.id}`)] : [];
  } });
  if (artistAccess) {
    sources.push(
      { label: "Projets", query: db.from("projets").select("id,titre,date_sortie").not("date_sortie", "is", null), map: row => [entry("project", row, row.titre, row.date_sortie, "Sortie", "Sortie", `/projets/${row.id}`)] },
      { label: "Rollout", query: db.from("rollout_events").select("id,titre,date_event,statut,projet_id").not("date_event", "is", null), map: row => [entry("rollout", row, row.titre, row.date_event, "Rollout", "Rollout", row.projet_id ? `/projets/${row.projet_id}` : "/rollout")] },
      { label: "Bookings", query: db.from("bookings").select("id,evenement,date_event,statut,prochaine_relance"), map: row => [
        ...(row.date_event ? [entry("booking", row, row.evenement, row.date_event, "Booking", "Booking", `/booking/${row.id}`)] : []),
        ...(row.prochaine_relance && staff ? [entry("booking-followup", row, `Relance : ${row.evenement}`, row.prochaine_relance, "Relance booking", "Relance", `/booking/${row.id}`)] : []),
      ] },
      { label: "Dates artistes", query: db.from("artiste_events").select("id,titre,date_event,statut").not("date_event", "is", null), map: row => [entry("artist", row, row.titre, row.date_event, "Artiste", "Artiste", "/calendrier")] },
      { label: "Contrats", query: db.from("contrats").select("id,titre,date_signature,statut").not("date_signature", "is", null), map: row => [entry("contract", row, row.titre, row.date_signature, "Contrat", "Contrat", `/contrats/${row.id}`)] },
      { label: "Release Planner", query: db.from("release_tasks").select("id,titre,date_prevue,statut,sortie_id").not("date_prevue", "is", null), map: row => [entry("release-task", row, row.titre, row.date_prevue, "Release Planner", "Sortie", `/release-planner/${row.sortie_id}`)] },
    );
  }
  if (staff) {
    for (const [table, label, type, path] of [["medias", "Médias", "Relance média", "/medias"], ["influenceurs", "Influenceurs", "Relance influenceur", "/influenceurs"], ...(admin ? [["partenaires", "Partenaires", "Relance partenaire", "/partenaires"]] : [])]) {
      sources.push({ label, query: db.from(table).select("id,nom,prochaine_relance,statut").not("prochaine_relance", "is", null), map: row => [entry(table, row, row.nom, row.prochaine_relance, type, "Relance", `${path}/${row.id}`)] });
    }
  }
  const results = await Promise.all(sources.map(async source => {
    try {
      const result = await source.query;
      if (result.error) { console.error("Calendar source unavailable", source.label, result.error.code); return { error: source.label, items: [] as CalendarItem[] }; }
      return { error: null, items: (result.data ?? []).flatMap(source.map).filter(item => item.date) };
    } catch { console.error("Calendar source unavailable", source.label); return { error: source.label, items: [] as CalendarItem[] }; }
  }));
  return { items: results.flatMap(result => result.items).sort((a,b) => a.date.localeCompare(b.date)), errors: results.flatMap(result => result.error ? [result.error] : []) };
}
