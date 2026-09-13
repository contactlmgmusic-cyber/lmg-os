begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.lmg_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

create or replace function private.lmg_artist_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.artiste_id from public.profiles p where p.id = auth.uid();
$$;

create or replace function private.lmg_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(p.email, '')) from public.profiles p where p.id = auth.uid();
$$;

revoke all on function private.lmg_role() from public;
revoke all on function private.lmg_artist_id() from public;
revoke all on function private.lmg_email() from public;
grant execute on function private.lmg_role() to authenticated;
grant execute on function private.lmg_artist_id() to authenticated;
grant execute on function private.lmg_email() to authenticated;

create or replace function private.lmg_protect_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() = old.id
     and private.lmg_role() not in ('super_admin', 'admin') then
    new.id := old.id;
    new.role := old.role;
    new.artiste_id := old.artiste_id;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_identity on public.profiles;
create trigger protect_profile_identity
before update on public.profiles
for each row execute function private.lmg_protect_profile_identity();

alter table public.profiles enable row level security;
alter table public.artistes enable row level security;
alter table public.projets enable row level security;
alter table public.splits enable row level security;
alter table public.split_participants enable row level security;
alter table public.royalties enable row level security;

drop policy if exists "Users can read profiles" on public.profiles;
drop policy if exists "authenticated can read profiles" on public.profiles;
drop policy if exists "admin can manage profiles" on public.profiles;
drop policy if exists "profiles_select_scoped" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;

create policy "profiles_select_scoped" on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or private.lmg_role() in ('super_admin', 'admin', 'artistic_director', 'manager')
);

create policy "profiles_update_self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

drop policy if exists "admin manager can manage artistes" on public.artistes;
drop policy if exists "authenticated can read artistes" on public.artistes;
drop policy if exists "artistes_select_scoped" on public.artistes;
drop policy if exists "artistes_write_scoped" on public.artistes;

create policy "artistes_select_scoped" on public.artistes
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or manager_id = auth.uid()
  or id = private.lmg_artist_id()
);

create policy "artistes_write_scoped" on public.artistes
for all to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and manager_id = auth.uid())
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and manager_id = auth.uid())
);

drop policy if exists "admin manager can manage projets" on public.projets;
drop policy if exists "authenticated can read projets" on public.projets;
drop policy if exists "projets_select_scoped" on public.projets;
drop policy if exists "projets_write_scoped" on public.projets;

create policy "projets_select_scoped" on public.projets
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or artiste_id = private.lmg_artist_id()
  or exists (
    select 1 from public.artistes a
    where a.id = projets.artiste_id and a.manager_id = auth.uid()
  )
);

create policy "projets_write_scoped" on public.projets
for all to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (
    select 1 from public.artistes a
    where a.id = projets.artiste_id and a.manager_id = auth.uid()
  ))
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (
    select 1 from public.artistes a
    where a.id = projets.artiste_id and a.manager_id = auth.uid()
  ))
);

drop policy if exists "splits_select_scoped" on public.splits;
drop policy if exists "splits_write_scoped" on public.splits;
create policy "splits_select_scoped" on public.splits
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or artiste_id = private.lmg_artist_id()
  or exists (select 1 from public.artistes a where a.id = splits.artiste_id and a.manager_id = auth.uid())
);
create policy "splits_write_scoped" on public.splits
for all to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (select 1 from public.artistes a where a.id = splits.artiste_id and a.manager_id = auth.uid()))
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (select 1 from public.artistes a where a.id = splits.artiste_id and a.manager_id = auth.uid()))
);

drop policy if exists "split_participants_select_scoped" on public.split_participants;
drop policy if exists "split_participants_write_scoped" on public.split_participants;
create policy "split_participants_select_scoped" on public.split_participants
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or lower(coalesce(email, '')) = private.lmg_email()
  or exists (select 1 from public.splits s where s.id = split_participants.split_id)
);
create policy "split_participants_write_scoped" on public.split_participants
for all to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (select 1 from public.splits s where s.id = split_participants.split_id))
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'manager' and exists (select 1 from public.splits s where s.id = split_participants.split_id))
);

drop policy if exists "royalties_select_scoped" on public.royalties;
drop policy if exists "royalties_admin_write" on public.royalties;
create policy "royalties_select_scoped" on public.royalties
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (private.lmg_role() = 'manager' and exists (
    select 1
    from public.projets p
    join public.artistes a on a.id = p.artiste_id
    where p.id = royalties.projet_id and a.manager_id = auth.uid()
  ))
  or lower(coalesce(email, '')) = private.lmg_email()
  or exists (
    select 1 from public.split_participants sp
    where sp.id = royalties.participant_id and lower(coalesce(sp.email, '')) = private.lmg_email()
  )
);
create policy "royalties_admin_write" on public.royalties
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

revoke all on public.profiles, public.artistes, public.projets,
  public.splits, public.split_participants, public.royalties from anon;

commit;
