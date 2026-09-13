begin;

alter table public.bookings enable row level security;
alter table public.contrats enable row level security;
alter table public.rollout_events enable row level security;

drop policy if exists "bookings_select_scoped" on public.bookings;
drop policy if exists "bookings_write_scoped" on public.bookings;

create policy "bookings_select_scoped"
on public.bookings
for select
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or artiste_id = private.lmg_artist_id()
  or exists (
    select 1
    from public.artistes a
    where a.id = bookings.artiste_id
      and a.manager_id = auth.uid()
  )
);

create policy "bookings_write_scoped"
on public.bookings
for all
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.artistes a
      where a.id = bookings.artiste_id
        and a.manager_id = auth.uid()
    )
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.artistes a
      where a.id = bookings.artiste_id
        and a.manager_id = auth.uid()
    )
  )
);

drop policy if exists "contrats_select_scoped" on public.contrats;
drop policy if exists "contrats_write_scoped" on public.contrats;
drop policy if exists "contrats_artist_signature" on public.contrats;

create policy "contrats_select_scoped"
on public.contrats
for select
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or artiste_id = private.lmg_artist_id()
  or exists (
    select 1
    from public.artistes a
    where a.id = contrats.artiste_id
      and a.manager_id = auth.uid()
  )
);

create policy "contrats_write_scoped"
on public.contrats
for all
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.artistes a
      where a.id = contrats.artiste_id
        and a.manager_id = auth.uid()
    )
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.artistes a
      where a.id = contrats.artiste_id
        and a.manager_id = auth.uid()
    )
  )
);

create policy "contrats_artist_signature"
on public.contrats
for update
to authenticated
using (
  private.lmg_role() = 'artiste'
  and artiste_id = private.lmg_artist_id()
)
with check (
  private.lmg_role() = 'artiste'
  and artiste_id = private.lmg_artist_id()
);

create or replace function private.lmg_protect_artist_contract_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.lmg_role() = 'artiste' then
    if new.id is distinct from old.id
       or new.titre is distinct from old.titre
       or new.type is distinct from old.type
       or new.artiste_id is distinct from old.artiste_id
       or new.projet_id is distinct from old.projet_id
       or new.fichier_url is distinct from old.fichier_url
       or new.notes is distinct from old.notes then
      raise exception 'Un artiste peut uniquement renseigner la signature de son contrat.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.lmg_protect_artist_contract_update() from public;

drop trigger if exists protect_artist_contract_update on public.contrats;
create trigger protect_artist_contract_update
before update on public.contrats
for each row
execute function private.lmg_protect_artist_contract_update();

drop policy if exists "admin manager member can manage rollout" on public.rollout_events;
drop policy if exists "authenticated can read rollout" on public.rollout_events;
drop policy if exists "rollout_select_scoped" on public.rollout_events;
drop policy if exists "rollout_write_scoped" on public.rollout_events;

create policy "rollout_select_scoped"
on public.rollout_events
for select
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or exists (
    select 1
    from public.projets p
    where p.id = rollout_events.projet_id
      and (
        p.artiste_id = private.lmg_artist_id()
        or exists (
          select 1
          from public.artistes a
          where a.id = p.artiste_id
            and a.manager_id = auth.uid()
        )
      )
  )
);

create policy "rollout_write_scoped"
on public.rollout_events
for all
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.projets p
      join public.artistes a on a.id = p.artiste_id
      where p.id = rollout_events.projet_id
        and a.manager_id = auth.uid()
    )
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and exists (
      select 1
      from public.projets p
      join public.artistes a on a.id = p.artiste_id
      where p.id = rollout_events.projet_id
        and a.manager_id = auth.uid()
    )
  )
);

commit;
