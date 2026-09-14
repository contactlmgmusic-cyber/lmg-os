alter table public.internal_projects
  add column if not exists pole text;

update public.internal_projects
set pole = 'Direction'
where pole is null or btrim(pole) = '';

alter table public.internal_projects
  alter column pole set default 'Direction',
  alter column pole set not null;

create index if not exists internal_projects_pole_category_idx
  on public.internal_projects (pole, categorie);
