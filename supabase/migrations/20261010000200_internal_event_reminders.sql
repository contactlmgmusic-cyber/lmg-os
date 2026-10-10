begin;

alter table public.internal_events
  add column if not exists reminder_minutes integer not null default 60,
  add column if not exists reminder_sent_at timestamptz;

alter table public.internal_events
  drop constraint if exists internal_events_reminder_minutes_check;

alter table public.internal_events
  add constraint internal_events_reminder_minutes_check
  check (reminder_minutes in (0, 15, 30, 60, 120, 1440));

create or replace function private.lmg_send_internal_event_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare sent_count integer := 0;
begin
  with due_events as (
    select event.*
    from public.internal_events event
    where event.reminder_sent_at is null
      and event.statut <> 'Annulé'
      and event.reminder_minutes > 0
      and event.date_debut > now()
      and event.date_debut - make_interval(mins => event.reminder_minutes) <= now()
    for update skip locked
  ), recipients as (
    select distinct event.id as event_id, event.titre, event.date_debut,
      unnest(array_append(event.participant_ids, event.created_by)) as user_id
    from due_events event
  ), inserted as (
    insert into public.notifications
      (user_id, created_by, type, titre, description, lien, niveau, lu, is_read)
    select recipient.user_id, null, 'Agenda', 'Rappel : ' || recipient.titre,
      'Cet événement commence le ' || to_char(recipient.date_debut at time zone 'Europe/Paris', 'DD/MM/YYYY à HH24:MI') || '.',
      '/evenements/' || recipient.event_id, 'Important', false, false
    from recipients recipient
    returning 1
  ), marked as (
    update public.internal_events event
    set reminder_sent_at = now(), updated_at = now()
    where event.id in (select id from due_events)
    returning 1
  )
  select count(*) into sent_count from inserted;

  return sent_count;
end;
$$;

revoke all on function private.lmg_send_internal_event_reminders() from public;

create extension if not exists pg_cron with schema extensions;

do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'lmg-internal-event-reminders' limit 1;
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
  perform cron.schedule(
    'lmg-internal-event-reminders',
    '*/5 * * * *',
    $job$select private.lmg_send_internal_event_reminders();$job$
  );
end;
$$;

commit;
