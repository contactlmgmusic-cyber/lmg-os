begin;

create or replace function private.lmg_is_task_assignee(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.task_assignees ta
    where ta.task_id = target_task_id
      and ta.user_id = auth.uid()
  );
$$;

create or replace function private.lmg_project_is_accessible(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projets p
    left join public.artistes a on a.id = p.artiste_id
    where p.id = target_project_id
      and (
        p.artiste_id = private.lmg_artist_id()
        or a.manager_id = auth.uid()
      )
  );
$$;

revoke all on function private.lmg_is_task_assignee(uuid) from public;
revoke all on function private.lmg_project_is_accessible(uuid) from public;
grant execute on function private.lmg_is_task_assignee(uuid) to authenticated;
grant execute on function private.lmg_project_is_accessible(uuid) to authenticated;

alter table public.taches enable row level security;
alter table public.assets enable row level security;

drop policy if exists "Allow read taches" on public.taches;
drop policy if exists "Allow insert taches" on public.taches;
drop policy if exists "Allow update taches" on public.taches;
drop policy if exists "Allow delete taches" on public.taches;
drop policy if exists "taches_select_scoped" on public.taches;
drop policy if exists "taches_insert_scoped" on public.taches;
drop policy if exists "taches_update_scoped" on public.taches;
drop policy if exists "taches_delete_scoped" on public.taches;

create policy "taches_select_scoped"
on public.taches
for select
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (
    projet_id is not null
    and private.lmg_project_is_accessible(projet_id)
  )
);

create policy "taches_insert_scoped"
on public.taches
for insert
to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and (
      responsable_id = auth.uid()
      or assigned_to = auth.uid()
      or (
        projet_id is not null
        and private.lmg_project_is_accessible(projet_id)
      )
    )
  )
);

create policy "taches_update_scoped"
on public.taches
for update
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (
    private.lmg_role() = 'manager'
    and projet_id is not null
    and private.lmg_project_is_accessible(projet_id)
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (
    private.lmg_role() = 'manager'
    and projet_id is not null
    and private.lmg_project_is_accessible(projet_id)
  )
);

create policy "taches_delete_scoped"
on public.taches
for delete
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and projet_id is not null
    and private.lmg_project_is_accessible(projet_id)
  )
);

create or replace function private.lmg_protect_assignee_task_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  can_manage_fully boolean;
begin
  can_manage_fully :=
    private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
    or (
      private.lmg_role() = 'manager'
      and old.projet_id is not null
      and private.lmg_project_is_accessible(old.projet_id)
    );

  if not can_manage_fully then
    if (to_jsonb(new) - array['statut', 'checklist'])
       is distinct from
       (to_jsonb(old) - array['statut', 'checklist']) then
      raise exception 'Vous pouvez uniquement modifier le statut et la checklist de cette tâche.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.lmg_protect_assignee_task_update() from public;

drop trigger if exists protect_assignee_task_update on public.taches;
create trigger protect_assignee_task_update
before update on public.taches
for each row
execute function private.lmg_protect_assignee_task_update();

drop policy if exists "admin manager member can manage assets" on public.assets;
drop policy if exists "authenticated can read assets" on public.assets;
drop policy if exists "assets_select_scoped" on public.assets;
drop policy if exists "assets_insert_scoped" on public.assets;
drop policy if exists "assets_update_scoped" on public.assets;
drop policy if exists "assets_delete_scoped" on public.assets;

create policy "assets_select_scoped"
on public.assets
for select
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or artiste_id = private.lmg_artist_id()
  or (
    artiste_id is not null
    and exists (
      select 1
      from public.artistes a
      where a.id = assets.artiste_id
        and a.manager_id = auth.uid()
    )
  )
  or (
    projet_id is not null
    and private.lmg_project_is_accessible(projet_id)
  )
  or (
    tache_id is not null
    and exists (
      select 1
      from public.taches t
      where t.id = assets.tache_id
    )
  )
);

create policy "assets_insert_scoped"
on public.assets
for insert
to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = assets.artiste_id
          and a.manager_id = auth.uid()
      )
      or (
        projet_id is not null
        and private.lmg_project_is_accessible(projet_id)
      )
      or (
        tache_id is not null
        and exists (
          select 1
          from public.taches t
          where t.id = assets.tache_id
        )
      )
    )
  )
  or (
    private.lmg_role() in ('artiste', 'prestataire')
    and tache_id is not null
    and exists (
      select 1
      from public.taches t
      where t.id = assets.tache_id
    )
  )
);

create policy "assets_update_scoped"
on public.assets
for update
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = assets.artiste_id
          and a.manager_id = auth.uid()
      )
      or (
        projet_id is not null
        and private.lmg_project_is_accessible(projet_id)
      )
    )
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = assets.artiste_id
          and a.manager_id = auth.uid()
      )
      or (
        projet_id is not null
        and private.lmg_project_is_accessible(projet_id)
      )
    )
  )
);

create policy "assets_delete_scoped"
on public.assets
for delete
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = assets.artiste_id
          and a.manager_id = auth.uid()
      )
      or (
        projet_id is not null
        and private.lmg_project_is_accessible(projet_id)
      )
    )
  )
);

revoke all on public.taches, public.assets from anon;

commit;
