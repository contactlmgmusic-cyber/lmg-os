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

    const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("artiste_id")
      .eq("id", userId)
      .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const { data: managedArtistes, error: artistesError } =
    await supabaseAdmin
      .from("artistes")
      .select("id")
      .eq("manager_id", userId);

  if (artistesError) {
    throw artistesError;
  }

  const artisteIds = Array.from(
    new Set([
      ...(managedArtistes || []).map((artiste) => artiste.id),
      ...(profile?.artiste_id ? [profile.artiste_id] : []),
    ])
  );

  const { data: linkedProjects, error: projectsError } =
    artisteIds.length > 0
      ? await supabaseAdmin
          .from("projets")
          .select("id")
          .in("artiste_id", artisteIds)
      : { data: [], error: null };

  if (projectsError) {
    throw projectsError;
  }

  const projectIds = (linkedProjects || []).map(
    (project) => project.id
  );

  const artisteIdSet = new Set(artisteIds);
  const projectIdSet = new Set(projectIds);

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
      .select("id, evenement, date_event, statut, ville, artiste_id")
      .not("date_event", "is", null),

    supabaseAdmin
      .from("rollout_events")
      .select("id, titre, date_event, statut, type, projet_id")
      .not("date_event", "is", null),

    supabaseAdmin
      .from("medias")
      .select("id, nom, prochaine_relance, statut, artiste_id, projet_id")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("influenceurs")
      .select("id, nom, prochaine_relance, statut, artiste_id, projet_id")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("taches")
      .select("id, titre, deadline, statut, responsable_id")
      .not("deadline", "is", null),

    supabaseAdmin
      .from("partenaires")
      .select("id, nom, prochaine_relance, statut, artiste_id, projet_id")
      .not("prochaine_relance", "is", null),

    supabaseAdmin
      .from("release_tasks")
      .select("id, titre, date_prevue, statut, responsable_id")
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
    ...(bookings || [])
  .filter((item) => artisteIdSet.has(item.artiste_id))
  .map((item) => ({
      id: item.id,
      sourceType: "booking",
      title: `LMG Booking — ${item.evenement}`,
      date: item.date_event,
      status: item.statut,
      description: "Booking LMG",
      location: item.ville,
    })),

    ...(rolloutEvents || [])
  .filter((item) => projectIdSet.has(item.projet_id))
  .map((item) => ({
      id: item.id,
      sourceType: "rollout",
      title: `LMG Rollout — ${item.titre}`,
      date: item.date_event,
      status: item.statut,
      description: item.type || "Action rollout",
    })),

    ...(medias || [])
  .filter(
    (item) =>
      artisteIdSet.has(item.artiste_id) ||
      projectIdSet.has(item.projet_id)
  )
  .map((item) => ({
      id: item.id,
      sourceType: "media",
      title: `LMG Relance média — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM médias",
    })),

    ...(influenceurs || [])
  .filter(
    (item) =>
      artisteIdSet.has(item.artiste_id) ||
      projectIdSet.has(item.projet_id)
  )
  .map((item) => ({
      id: item.id,
      sourceType: "influenceur",
      title: `LMG Relance influenceur — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM influenceurs",
    })),

    ...(taches || [])
  .filter((item) => item.responsable_id === userId)
  .map((item) => ({
      id: item.id,
      sourceType: "tache",
      title: `LMG Tâche — ${item.titre}`,
      date: item.deadline,
      status: item.statut,
      description: "Deadline tâche",
    })),

    ...(partenaires || [])
  .filter(
    (item) =>
      artisteIdSet.has(item.artiste_id) ||
      projectIdSet.has(item.projet_id)
  )
  .map((item) => ({
      id: item.id,
      sourceType: "partenaire",
      title: `LMG Relance partenaire — ${item.nom}`,
      date: item.prochaine_relance,
      status: item.statut,
      description: "Relance CRM partenaires",
    })),

    ...(releaseTasks || [])
  .filter((item) => item.responsable_id === userId)
  .map((item) => ({
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
    let deleted = 0;

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

    const activeKeys = new Set(
    calendarItems.map(
      (item) => `${item.sourceType}:${item.id}`
    )
  );

  const managedSourceTypes = [
    "booking",
    "rollout",
    "media",
    "influenceur",
    "tache",
    "partenaire",
    "release-task",
  ];

  const { data: syncedEvents, error: syncedEventsError } =
    await supabaseAdmin
      .from("google_calendar_event_syncs")
      .select("id, source_type, source_id, google_event_id")
      .eq("user_id", userId)
      .in("source_type", managedSourceTypes);

  if (syncedEventsError) {
    throw syncedEventsError;
  }

  for (const syncedEvent of syncedEvents || []) {
    const key = `${syncedEvent.source_type}:${syncedEvent.source_id}`;

    if (activeKeys.has(key)) {
      continue;
    }

    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: syncedEvent.google_event_id,
      });
    } catch (error) {
      const googleError = error as {
        code?: number;
        response?: {
          status?: number;
        };
      };

      const status =
        googleError.response?.status || googleError.code;

      if (status !== 404 && status !== 410) {
        throw error;
      }
    }

    const { error: deleteSyncError } = await supabaseAdmin
      .from("google_calendar_event_syncs")
      .delete()
      .eq("id", syncedEvent.id);

    if (deleteSyncError) {
      throw deleteSyncError;
    }

    deleted += 1;
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
    deleted,
    total: calendarItems.length,
  };
}

