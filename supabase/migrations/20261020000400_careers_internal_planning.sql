begin;

alter table public.careers_applications
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists interview_event_id uuid references public.internal_events(id) on delete set null;

create index if not exists careers_applications_assigned_to_idx
  on public.careers_applications(assigned_to);
create index if not exists careers_applications_next_action_at_idx
  on public.careers_applications(next_action_at)
  where next_action_at is not null;

alter table public.careers_application_events
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.careers_application_events
  drop constraint if exists careers_application_events_event_type_check;
alter table public.careers_application_events
  add constraint careers_application_events_event_type_check
  check (event_type in (
    'created', 'status_changed', 'assignment_changed',
    'action_updated', 'interview_scheduled'
  ));

create or replace function public.manage_careers_planning(
  p_application_id uuid,
  p_assigned_to uuid,
  p_next_action text,
  p_next_action_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous_assignee uuid;
begin
  if private.lmg_role() not in ('super_admin', 'admin') then
    raise exception 'Unauthorized';
  end if;
  if p_next_action is not null and char_length(trim(p_next_action)) > 500 then
    raise exception 'Next action is too long';
  end if;
  select assigned_to into previous_assignee
  from public.careers_applications where id = p_application_id for update;
  if not found then raise exception 'Application not found'; end if;

  update public.careers_applications
  set assigned_to = p_assigned_to,
      next_action = nullif(trim(p_next_action), ''),
      next_action_at = p_next_action_at
  where id = p_application_id;

  if previous_assignee is distinct from p_assigned_to then
    insert into public.careers_application_events(application_id, event_type, actor_id, details)
    values (p_application_id, 'assignment_changed', auth.uid(),
      jsonb_build_object('from', previous_assignee, 'to', p_assigned_to));
  end if;
  insert into public.careers_application_events(application_id, event_type, actor_id, details)
  values (p_application_id, 'action_updated', auth.uid(),
    jsonb_build_object('action', nullif(trim(p_next_action), ''), 'due_at', p_next_action_at));

  if p_assigned_to is not null and previous_assignee is distinct from p_assigned_to then
    insert into public.notifications(user_id, created_by, type, titre, description, lien, link, niveau, lu, is_read)
    values (p_assigned_to, auth.uid(), 'Recrutement', 'Candidature attribuée',
      'Un dossier Careers vous a été attribué.',
      '/recrutement/candidatures/' || p_application_id,
      '/recrutement/candidatures/' || p_application_id,
      'Important', false, false);
  end if;
end;
$$;

revoke all on function public.manage_careers_planning(uuid, uuid, text, timestamptz) from public;
grant execute on function public.manage_careers_planning(uuid, uuid, text, timestamptz) to authenticated;

create or replace function public.schedule_careers_interview(
  p_application_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_location text,
  p_video_link text,
  p_participant_ids uuid[],
  p_reminder_minutes integer
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  application_record record;
  event_id uuid;
begin
  if private.lmg_role() not in ('super_admin', 'admin') then raise exception 'Unauthorized'; end if;
  if p_start is null or p_start <= now() or p_end is null or p_end <= p_start then
    raise exception 'Invalid interview dates';
  end if;
  if p_reminder_minutes not in (0, 15, 30, 60, 120, 1440) then
    raise exception 'Invalid reminder';
  end if;
  select id, first_name, last_name, interview_event_id into application_record
  from public.careers_applications where id = p_application_id for update;
  if not found then raise exception 'Application not found'; end if;

  if application_record.interview_event_id is null then
    insert into public.internal_events(
      titre, description, type, date_debut, date_fin, lieu, lien_visio,
      participant_ids, reminder_minutes, created_by, statut
    ) values (
      'Entretien · ' || application_record.first_name || ' ' || application_record.last_name,
      'Entretien de recrutement LMG Careers', 'Entretien', p_start, p_end,
      nullif(trim(p_location), ''), nullif(trim(p_video_link), ''),
      coalesce(p_participant_ids, '{}'::uuid[]), p_reminder_minutes, auth.uid(), 'Confirmé'
    ) returning id into event_id;
  else
    event_id := application_record.interview_event_id;
    update public.internal_events set
      date_debut = p_start, date_fin = p_end,
      lieu = nullif(trim(p_location), ''), lien_visio = nullif(trim(p_video_link), ''),
      participant_ids = coalesce(p_participant_ids, '{}'::uuid[]),
      reminder_minutes = p_reminder_minutes, reminder_sent_at = null, updated_at = now()
    where id = event_id;
  end if;

  update public.careers_applications
  set interview_event_id = event_id, status = 'interview'
  where id = p_application_id;
  insert into public.careers_application_events(application_id, event_type, actor_id, details)
  values (p_application_id, 'interview_scheduled', auth.uid(),
    jsonb_build_object('event_id', event_id, 'start', p_start, 'end', p_end));
  return event_id;
end;
$$;

revoke all on function public.schedule_careers_interview(uuid, timestamptz, timestamptz, text, text, uuid[], integer) from public;
grant execute on function public.schedule_careers_interview(uuid, timestamptz, timestamptz, text, text, uuid[], integer) to authenticated;

commit;
