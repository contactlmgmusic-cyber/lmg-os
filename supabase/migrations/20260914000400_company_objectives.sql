create table if not exists public.company_objectives (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  pole text not null default 'Direction',
  trimestre text not null,
  indicateur text not null,
  unite text not null default '%',
  valeur_initiale numeric not null default 0,
  valeur_actuelle numeric not null default 0,
  valeur_cible numeric not null,
  statut text not null default 'En cours',
  niveau_risque text not null default 'Maîtrisé',
  owner_id uuid references public.profiles(id) on delete set null,
  internal_project_id uuid references public.internal_projects(id) on delete set null,
  date_debut date,
  deadline date not null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valeur_cible <> valeur_initiale)
);

create table if not exists public.company_objective_updates (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.company_objectives(id) on delete cascade,
  valeur numeric not null,
  commentaire text,
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists company_objectives_quarter_idx on public.company_objectives(trimestre, pole);
create index if not exists company_objective_updates_objective_idx on public.company_objective_updates(objective_id, created_at desc);

alter table public.company_objectives enable row level security;
alter table public.company_objective_updates enable row level security;

drop policy if exists company_objectives_team_access on public.company_objectives;
create policy company_objectives_team_access on public.company_objectives for all to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']))
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

drop policy if exists company_objective_updates_team_access on public.company_objective_updates;
create policy company_objective_updates_team_access on public.company_objective_updates for all to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']))
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

revoke all on public.company_objectives, public.company_objective_updates from anon;
grant select, insert, update, delete on public.company_objectives, public.company_objective_updates to authenticated;
