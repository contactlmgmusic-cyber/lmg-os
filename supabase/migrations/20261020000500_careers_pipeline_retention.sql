begin;

alter table public.careers_applications
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists retention_until timestamptz;

create index if not exists careers_applications_archived_at_idx
  on public.careers_applications(archived_at);
create index if not exists careers_applications_retention_until_idx
  on public.careers_applications(retention_until)
  where retention_until is not null;

alter table public.careers_application_events
  drop constraint if exists careers_application_events_event_type_check;
alter table public.careers_application_events
  add constraint careers_application_events_event_type_check
  check (event_type in (
    'created', 'status_changed', 'assignment_changed', 'action_updated',
    'interview_scheduled', 'archived', 'restored'
  ));

create or replace function public.manage_careers_archive(
  p_application_id uuid,
  p_archived boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if private.lmg_role() not in ('super_admin', 'admin') then
    raise exception 'Unauthorized';
  end if;

  update public.careers_applications
  set archived_at = case when p_archived then now() else null end,
      archived_by = case when p_archived then auth.uid() else null end,
      retention_until = case when p_archived then now() + interval '24 months' else null end
  where id = p_application_id;
  if not found then raise exception 'Application not found'; end if;

  insert into public.careers_application_events(application_id, event_type, actor_id, details)
  values (
    p_application_id,
    case when p_archived then 'archived' else 'restored' end,
    auth.uid(),
    jsonb_build_object('retention_until', case when p_archived then now() + interval '24 months' else null end)
  );
end;
$$;

revoke all on function public.manage_careers_archive(uuid, boolean) from public;
grant execute on function public.manage_careers_archive(uuid, boolean) to authenticated;

commit;
