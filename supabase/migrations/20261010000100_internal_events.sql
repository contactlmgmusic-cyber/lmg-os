begin;

create table if not exists public.internal_events (
  id uuid primary key default gen_random_uuid(),
  titre text not null check (char_length(trim(titre)) between 1 and 160),
  description text,
  type text not null default 'Réunion',
  date_debut timestamptz not null,
  date_fin timestamptz,
  toute_la_journee boolean not null default false,
  lieu text,
  lien_visio text,
  statut text not null default 'Confirmé',
  participant_ids uuid[] not null default '{}',
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_events_dates check (date_fin is null or date_fin >= date_debut)
);

create index if not exists internal_events_date_debut_idx on public.internal_events(date_debut);
create index if not exists internal_events_created_by_idx on public.internal_events(created_by);

alter table public.internal_events enable row level security;

drop policy if exists internal_events_staff_read on public.internal_events;
drop policy if exists internal_events_staff_insert on public.internal_events;
drop policy if exists internal_events_owner_update on public.internal_events;
drop policy if exists internal_events_owner_delete on public.internal_events;

create policy internal_events_staff_read on public.internal_events for select to authenticated
using (private.lmg_role() in ('super_admin', 'admin', 'manager', 'artistic_director'));

create policy internal_events_staff_insert on public.internal_events for insert to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin', 'manager', 'artistic_director')
  and created_by = auth.uid()
);

create policy internal_events_owner_update on public.internal_events for update to authenticated
using (created_by = auth.uid() or private.lmg_role() in ('super_admin', 'admin'))
with check (created_by = auth.uid() or private.lmg_role() in ('super_admin', 'admin'));

create policy internal_events_owner_delete on public.internal_events for delete to authenticated
using (created_by = auth.uid() or private.lmg_role() in ('super_admin', 'admin'));

grant select, insert, update, delete on public.internal_events to authenticated;
revoke all on public.internal_events from anon;

commit;
