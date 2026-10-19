begin;

-- Add the talent-pool workflow state without weakening the existing constraint.
alter table public.careers_applications
  drop constraint if exists careers_applications_status_check;

alter table public.careers_applications
  add constraint careers_applications_status_check
  check (status in ('new', 'review', 'interview', 'selected', 'rejected', 'talent_pool'));

create table if not exists public.careers_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.careers_applications(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed')),
  from_status text,
  to_status text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists careers_application_events_application_idx
  on public.careers_application_events(application_id, created_at desc);

create table if not exists public.careers_application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.careers_applications(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists careers_application_notes_application_idx
  on public.careers_application_notes(application_id, created_at desc);

alter table public.careers_application_events enable row level security;
alter table public.careers_application_notes enable row level security;

grant select on public.careers_application_events to authenticated;
grant select, insert on public.careers_application_notes to authenticated;

drop policy if exists "Careers admins can read application events"
  on public.careers_application_events;
create policy "Careers admins can read application events"
on public.careers_application_events
for select to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

drop policy if exists "Careers admins can read application notes"
  on public.careers_application_notes;
create policy "Careers admins can read application notes"
on public.careers_application_notes
for select to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

drop policy if exists "Careers admins can create application notes"
  on public.careers_application_notes;
create policy "Careers admins can create application notes"
on public.careers_application_notes
for insert to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

create or replace function private.lmg_audit_careers_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.careers_application_events (
      application_id, event_type, to_status, actor_id
    ) values (
      new.id, 'created', new.status, auth.uid()
    );
  elsif new.status is distinct from old.status then
    insert into public.careers_application_events (
      application_id, event_type, from_status, to_status, actor_id
    ) values (
      new.id, 'status_changed', old.status, new.status, auth.uid()
    );
  end if;

  return new;
end;
$$;

revoke all on function private.lmg_audit_careers_application() from public;

drop trigger if exists audit_careers_application on public.careers_applications;
create trigger audit_careers_application
after insert or update of status on public.careers_applications
for each row execute function private.lmg_audit_careers_application();

create or replace function public.manage_careers_application(
  p_application_id uuid,
  p_status text default null,
  p_note text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  ) then
    raise exception 'Unauthorized';
  end if;

  if p_status is not null then
    if p_status not in ('new', 'review', 'interview', 'selected', 'rejected', 'talent_pool') then
      raise exception 'Invalid status';
    end if;

    update public.careers_applications
      set status = p_status
      where id = p_application_id;

    if not found then
      raise exception 'Application not found';
    end if;
  elsif not exists (
    select 1 from public.careers_applications where id = p_application_id
  ) then
    raise exception 'Application not found';
  end if;

  if nullif(btrim(p_note), '') is not null then
    if char_length(btrim(p_note)) > 5000 then
      raise exception 'Note too long';
    end if;

    insert into public.careers_application_notes(application_id, author_id, body)
    values (p_application_id, auth.uid(), btrim(p_note));
  end if;
end;
$$;

revoke all on function public.manage_careers_application(uuid, text, text)
  from public, anon;
grant execute on function public.manage_careers_application(uuid, text, text)
  to authenticated;

commit;
