import "server-only";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  createGoogleCalendarApi,
  createGoogleCalendarOAuthClient,
} from "@/lib/google-calendar.server";

type LmgCalendarItem = {
  id: string;
  sourceType: string;
  title: string;
  date: string;
  status?: string | null;
  description?: string | null;
  location?: string | null;
};

function createEventDates(dateValue: string) {
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);

  if (isAllDay) {
    const endDate = new Date(`${dateValue}T12:00:00`);
    endDate.setDate(endDate.getDate() + 1);

    return {
      start: { date: dateValue },
      end: { date: endDate.toISOString().slice(0, 10) },
    };
  }

  const startDate = new Date(dateValue);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Europe/Paris",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Europe/Paris",
    },
  };
}
export async function syncGoogleCalendarForUser(
  userId: string,
  origin: string
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: connection, error: connectionError } =
    await supabaseAdmin
      .from("google_calendar_connections")
      .select("access_token, refresh_token, expiry_date")
      .eq("user_id", userId)
      .single();

  if (connectionError || !connection?.refresh_token) {
    throw new Error("Google Calendar n’est pas connecté.");
  }

  const oauthClient = createGoogleCalendarOAuthClient(
    `${origin}/api/google-calendar/callback`
  );

  oauthClient.setCredentials({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
    expiry_date: connection.expiry_date,
  });

  const calendar = createGoogleCalendarApi(oauthClient);

  const [
    { data: bookings, error: bookingsError },
    { data: rolloutEvents, error: rolloutError },
    { data: medias, error: mediasError },
    { data: influenceurs, error: influenceursError },
    { data: taches, error: tachesError },
    { data: partenaires, error: partenairesError },
    { data: releaseTasks, error: releaseTasksError },
  ] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select("id, evenement, date_event, statut, ville")
      .not("date_event", "is", null),

    supabaseAdmin
      .from("rollout_events")
      .select("id, titre, date_event, statut, type")
      .not("date_event", "is", null),

    supabaseAdmin
      .from("medias")
      .select("id, nom, prochaine_relance, statut")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("influenceurs")
      .select("id, nom, prochaine_relance, statut")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("taches")
      .select("id, titre, deadline, statut")
      .not("deadline", "is", null),

    supabaseAdmin
      .from("partenaires")
      .select("id, nom, prochaine_relance, statut")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("release_tasks")
      .select("id, titre, date_prevue, statut")
      .not("date_prevue", "is", null),
  ]);

  const loadError =
    bookingsError ||
    rolloutError ||
    mediasError ||
    influenceursError ||
    tachesError ||
    partenairesError ||
    releaseTasksError;

  if (loadError) {
    throw loadError;
  }

  const calendarItems: LmgCalendarItem[] = [
    ...(bookings || []).map((item) => ({
      id: item.id,
      sourceType: "booking",
      title: `LMG Booking — ${item.evenement}`,
      date: item.date_event,
      status: item.statut,
      description: "Booking LMG",
      location: item.ville,
    })),

    ...(rolloutEvents || []).map((item) => ({
      id: item.id,
      sourceType: "rollout",
      title: `LMG Rollout — ${item.titre}`,
      date: item.date_event,
      status: item.statut,
      description: item.type || "Action rollout",
    })),

    ...(medias || []).map((item) => ({
      id: item.id,
      sourceType: "media",
      title: `LMG Relance média — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM médias",
    })),

    ...(influenceurs || []).map((item) => ({
      id: item.id,
      sourceType: "influenceur",
      title: `LMG Relance influenceur — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM influenceurs",
    })),

    ...(taches || []).map((item) => ({
      id: item.id,
      sourceType: "tache",
      title: `LMG Tâche — ${item.titre}`,
      date: item.deadline,
      status: item.statut,
      description: "Deadline tâche",
    })),

    ...(partenaires || []).map((item) => ({
      id: item.id,
      sourceType: "partenaire",
      title: `LMG Relance partenaire — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM partenaires",
    })),

    ...(releaseTasks || []).map((item) => ({
      id: item.id,
      sourceType: "release-task",
      title: `LMG Release — ${item.titre}`,
      date: item.date_prevue,
      status: item.statut,
      description: "Action Release Planner",
    })),
  ];

    let created = 0;
  let updated = 0;

  for (const item of calendarItems) {
    const event = {
      summary: item.title,
      description: [
        `Statut : ${item.status || "Non renseigné"}`,
        item.description || "Événement LMG OS",
        "Synchronisé depuis LMG OS",
      ].join("\n"),
      location: item.location || undefined,
      ...createEventDates(item.date),
    };

    const contentHash = createHash("sha256")
      .update(JSON.stringify(event))
      .digest("hex");

    const { data: existingSync } = await supabaseAdmin
      .from("google_calendar_event_syncs")
      .select("google_event_id, content_hash")
      .eq("user_id", userId)
      .eq("source_type", item.sourceType)
      .eq("source_id", item.id)
      .maybeSingle();

    if (
      existingSync?.google_event_id &&
      existingSync.content_hash === contentHash
    ) {
      continue;
    }

    let googleEventId = existingSync?.google_event_id;

    if (googleEventId) {
      await calendar.events.update({
        calendarId: "primary",
        eventId: googleEventId,
        requestBody: event,
      });

      updated += 1;
    } else {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      googleEventId = response.data.id || undefined;
      created += 1;
    }

    if (!googleEventId) {
      throw new Error(
        `Identifiant Google absent pour ${item.sourceType} ${item.id}.`
      );
    }

    const { error: syncError } = await supabaseAdmin
      .from("google_calendar_event_syncs")
      .upsert(
        {
          user_id: userId,
          source_type: item.sourceType,
          source_id: item.id,
          google_event_id: googleEventId,
          content_hash: contentHash,
          last_synced_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,source_type,source_id",
        }
      );

    if (syncError) {
      throw syncError;
    }
  }

  const refreshedCredentials = oauthClient.credentials;

  await supabaseAdmin
    .from("google_calendar_connections")
    .update({
      access_token:
        refreshedCredentials.access_token || connection.access_token,
      expiry_date:
        refreshedCredentials.expiry_date || connection.expiry_date,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return {
    created,
    updated,
    total: calendarItems.length,
  };
}

