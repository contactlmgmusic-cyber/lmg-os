create table if not exists public.internal_projects (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  categorie text,
  statut text not null default 'À cadrer',
  priorite text not null default 'Moyenne',
  objectif text,
  contexte text,
  perimetre text,
  criteres_reussite text,
  risques text,
  consignes text,
  decisions text,
  ressources text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  date_debut date,
  deadline date,
  progression integer not null default 0 check (progression between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.internal_project_members (
  project_id uuid not null references public.internal_projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_projet text not null default 'Contributeur',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.internal_project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.internal_projects(id) on delete cascade,
  titre text not null,
  statut text not null default 'À faire',
  deadline date,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.internal_project_resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.internal_projects(id) on delete cascade,
  nom text not null,
  url text not null,
  type_ressource text not null default 'Lien',
  added_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.internal_project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.internal_projects(id) on delete cascade,
  contenu text not null,
  type_update text not null default 'Mise à jour',
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.taches
  add column if not exists internal_project_id uuid references public.internal_projects(id) on delete set null;

create index if not exists internal_projects_owner_idx on public.internal_projects(owner_id);
create index if not exists internal_projects_status_idx on public.internal_projects(statut);
create index if not exists taches_internal_project_idx on public.taches(internal_project_id);

alter table public.internal_projects enable row level security;
alter table public.internal_project_members enable row level security;
alter table public.internal_project_milestones enable row level security;
alter table public.internal_project_resources enable row level security;
alter table public.internal_project_updates enable row level security;

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

do $$
declare table_name text;
begin
  foreach table_name in array array['internal_project_members','internal_project_milestones','internal_project_resources','internal_project_updates']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_team_access', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.current_user_role() = any (array[''super_admin'',''admin'',''artistic_director'',''manager''])) with check (public.current_user_role() = any (array[''super_admin'',''admin'',''artistic_director'',''manager'']))',
      table_name || '_team_access', table_name
    );
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end $$;
