import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase-auth.server";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.ARTISTIC_DIRECTOR].includes(profile?.role as any)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const [{ data: tasks }, { data: internalEvents }] = await Promise.all([
    supabase.from("taches").select("id,titre,deadline,priorite,responsable_id,assigned_to,task_assignees(user_id)").gte("deadline", today).neq("statut", "Terminé").order("deadline").limit(100),
    supabase.from("internal_events").select("id,titre,description,type,date_debut,date_fin,toute_la_journee,lieu,participant_ids,created_by,reminder_minutes,statut").gte("date_debut", now).neq("statut", "Annulé").order("date_debut").limit(100),
  ]);

  const personalTasks = (tasks || []).filter((task: any) => task.responsable_id === user.id || task.assigned_to === user.id || task.task_assignees?.some((item: any) => item.user_id === user.id));
  const personalEvents = (internalEvents || []).filter((event: any) => event.created_by === user.id || event.participant_ids?.includes(user.id));

  const items = [
    ...personalEvents.map((event: any) => ({
      key: `event-${event.id}`,
      title: event.titre,
      notes: event.description || `${event.type || "Événement"} · LMG Admin`,
      location: event.lieu || undefined,
      start: event.date_debut,
      end: event.date_fin || new Date(new Date(event.date_debut).getTime() + 60 * 60 * 1000).toISOString(),
      allDay: Boolean(event.toute_la_journee),
      reminderMinutes: Number(event.reminder_minutes ?? 60),
      url: `/mobile/agenda/interne/${event.id}`,
    })),
    ...personalTasks.map((task: any) => ({
      key: `task-${task.id}`,
      title: `LMG · ${task.titre}`,
      notes: `Échéance ${task.priorite || "LMG"}`,
      start: task.deadline.length === 10 ? `${task.deadline}T09:00:00` : task.deadline,
      end: task.deadline.length === 10 ? `${task.deadline}T10:00:00` : new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000).toISOString(),
      allDay: false,
      reminderMinutes: 60,
      url: `/mobile/taches/${task.id}`,
    })),
  ];

  return NextResponse.json({ items });
}
