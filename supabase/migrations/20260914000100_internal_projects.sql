create table if not exists public.internal_projects (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  categorie text,
  statut text not null default 'À cadrer',
  priorite text not null default 'Moyenne',
  objectif text,
  contexte text,
  consignes text,
  decisions text,
  ressources text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  date_debut date,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.taches
  add column if not exists internal_project_id uuid references public.internal_projects(id) on delete set null;

create index if not exists internal_projects_owner_idx on public.internal_projects(owner_id);
create index if not exists internal_projects_status_idx on public.internal_projects(statut);
create index if not exists taches_internal_project_idx on public.taches(internal_project_id);

alter table public.internal_projects enable row level security;

drop policy if exists internal_projects_select on public.internal_projects;
create policy internal_projects_select on public.internal_projects for select to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

drop policy if exists internal_projects_insert on public.internal_projects;
create policy internal_projects_insert on public.internal_projects for insert to authenticated
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

drop policy if exists internal_projects_update on public.internal_projects;
create policy internal_projects_update on public.internal_projects for update to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']))
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

drop policy if exists internal_projects_delete on public.internal_projects;
create policy internal_projects_delete on public.internal_projects for delete to authenticated
using (public.current_user_role() = any (array['super_admin','admin']));

revoke all on public.internal_projects from anon;
grant select, insert, update, delete on public.internal_projects to authenticated;

