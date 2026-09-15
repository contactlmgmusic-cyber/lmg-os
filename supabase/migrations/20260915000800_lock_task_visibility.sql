begin;

-- Une tâche LMG n'est globale que pour les administrateurs.
-- La Direction artistique voit ses tâches assignées et celles qu'elle a créées.
-- Tous les autres rôles ne voient que leurs tâches directement assignées.
do $$
declare policy_row record;
begin
  for policy_row in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'taches'
  loop
    execute format('drop policy if exists %I on public.taches', policy_row.policyname);
  end loop;
end $$;

create policy taches_select_strict on public.taches
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (private.lmg_role() = 'artistic_director' and created_by = auth.uid())
);

create policy taches_insert_strict on public.taches
for insert to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'artistic_director' and created_by = auth.uid())
);

create policy taches_update_strict on public.taches
for update to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (private.lmg_role() = 'artistic_director' and created_by = auth.uid())
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
  or (private.lmg_role() = 'artistic_director' and created_by = auth.uid())
);

create policy taches_delete_strict on public.taches
for delete to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'artistic_director' and created_by = auth.uid())
);

create or replace function private.lmg_protect_assignee_task_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.lmg_role() not in ('super_admin', 'admin')
     and not (private.lmg_role() = 'artistic_director' and old.created_by = auth.uid())
     and (to_jsonb(new) - array['statut', 'checklist'])
         is distinct from
         (to_jsonb(old) - array['statut', 'checklist']) then
    raise exception 'Une personne assignée peut uniquement modifier le statut et la checklist.';
  end if;
  return new;
end;
$$;

commit;
