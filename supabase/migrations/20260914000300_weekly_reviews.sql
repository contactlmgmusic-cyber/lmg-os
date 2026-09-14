create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  meeting_date timestamptz,
  statut text not null default 'À préparer',
  compte_rendu text,
  priorites_suivantes text,
  facilitator_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_review_decisions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.weekly_reviews(id) on delete cascade,
  decision text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  internal_project_id uuid references public.internal_projects(id) on delete set null,
  deadline date,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists weekly_reviews_week_idx on public.weekly_reviews(week_start desc);
create index if not exists weekly_review_decisions_review_idx on public.weekly_review_decisions(review_id);

alter table public.weekly_reviews enable row level security;
alter table public.weekly_review_decisions enable row level security;

drop policy if exists weekly_reviews_team_access on public.weekly_reviews;
create policy weekly_reviews_team_access on public.weekly_reviews for all to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']))
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

drop policy if exists weekly_review_decisions_team_access on public.weekly_review_decisions;
create policy weekly_review_decisions_team_access on public.weekly_review_decisions for all to authenticated
using (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']))
with check (public.current_user_role() = any (array['super_admin','admin','artistic_director','manager']));

revoke all on public.weekly_reviews, public.weekly_review_decisions from anon;
grant select, insert, update, delete on public.weekly_reviews, public.weekly_review_decisions to authenticated;
