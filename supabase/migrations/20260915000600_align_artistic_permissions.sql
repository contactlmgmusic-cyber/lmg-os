begin;

drop policy if exists "artistes_write_scoped" on public.artistes;
drop policy if exists "artistes_admin_all" on public.artistes;
drop policy if exists "artistes_artistic_insert" on public.artistes;
drop policy if exists "artistes_artistic_update" on public.artistes;
drop policy if exists "artistes_manager_insert" on public.artistes;
drop policy if exists "artistes_manager_update" on public.artistes;

create policy "artistes_admin_all" on public.artistes
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

create policy "artistes_artistic_insert" on public.artistes
for insert to authenticated
with check (private.lmg_role() = 'artistic_director');

create policy "artistes_artistic_update" on public.artistes
for update to authenticated
using (private.lmg_role() = 'artistic_director')
with check (private.lmg_role() = 'artistic_director');

create policy "artistes_manager_insert" on public.artistes
for insert to authenticated
with check (private.lmg_role() = 'manager' and manager_id = auth.uid());

create policy "artistes_manager_update" on public.artistes
for update to authenticated
using (private.lmg_role() = 'manager' and manager_id = auth.uid())
with check (private.lmg_role() = 'manager' and manager_id = auth.uid());

drop policy if exists "projets_write_scoped" on public.projets;
drop policy if exists "projets_admin_all" on public.projets;
drop policy if exists "projets_artistic_insert" on public.projets;
drop policy if exists "projets_artistic_update" on public.projets;
drop policy if exists "projets_manager_insert" on public.projets;
drop policy if exists "projets_manager_update" on public.projets;

create policy "projets_admin_all" on public.projets
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

create policy "projets_artistic_insert" on public.projets
for insert to authenticated
with check (private.lmg_role() = 'artistic_director');

create policy "projets_artistic_update" on public.projets
for update to authenticated
using (private.lmg_role() = 'artistic_director')
with check (private.lmg_role() = 'artistic_director');

create policy "projets_manager_insert" on public.projets
for insert to authenticated
with check (
  private.lmg_role() = 'manager'
  and exists (select 1 from public.artistes a where a.id = projets.artiste_id and a.manager_id = auth.uid())
);

create policy "projets_manager_update" on public.projets
for update to authenticated
using (
  private.lmg_role() = 'manager'
  and exists (select 1 from public.artistes a where a.id = projets.artiste_id and a.manager_id = auth.uid())
)
with check (
  private.lmg_role() = 'manager'
  and exists (select 1 from public.artistes a where a.id = projets.artiste_id and a.manager_id = auth.uid())
);

drop policy if exists "rollout_write_scoped" on public.rollout_events;
drop policy if exists "rollout_admin_all" on public.rollout_events;
drop policy if exists "rollout_artistic_insert" on public.rollout_events;
drop policy if exists "rollout_artistic_update" on public.rollout_events;
drop policy if exists "rollout_manager_insert" on public.rollout_events;
drop policy if exists "rollout_manager_update" on public.rollout_events;

create policy "rollout_admin_all" on public.rollout_events
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

create policy "rollout_artistic_insert" on public.rollout_events
for insert to authenticated
with check (private.lmg_role() = 'artistic_director');

create policy "rollout_artistic_update" on public.rollout_events
for update to authenticated
using (private.lmg_role() = 'artistic_director')
with check (private.lmg_role() = 'artistic_director');

create policy "rollout_manager_insert" on public.rollout_events
for insert to authenticated
with check (
  private.lmg_role() = 'manager'
  and exists (
    select 1 from public.projets p join public.artistes a on a.id = p.artiste_id
    where p.id = rollout_events.projet_id and a.manager_id = auth.uid()
  )
);

create policy "rollout_manager_update" on public.rollout_events
for update to authenticated
using (
  private.lmg_role() = 'manager'
  and exists (
    select 1 from public.projets p join public.artistes a on a.id = p.artiste_id
    where p.id = rollout_events.projet_id and a.manager_id = auth.uid()
  )
)
with check (
  private.lmg_role() = 'manager'
  and exists (
    select 1 from public.projets p join public.artistes a on a.id = p.artiste_id
    where p.id = rollout_events.projet_id and a.manager_id = auth.uid()
  )
);

commit;
