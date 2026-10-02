-- ============================================================
-- LMG CAREERS
-- Jobs + applications
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- JOBS
-- ------------------------------------------------------------

create table if not exists public.careers_jobs (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  slug text not null unique,

  department text not null check (
    department in (
      'music',
      'creative',
      'business',
      'tech_digital'
    )
  ),

  employment_type text not null check (
    employment_type in (
      'cdi',
      'cdd',
      'stage',
      'alternance',
      'freelance',
      'project'
    )
  ),

  location text,
  remote_policy text check (
    remote_policy is null or
    remote_policy in (
      'onsite',
      'hybrid',
      'remote'
    )
  ),

  short_description text,
  description text not null,

  responsibilities text,
  profile text,
  benefits text,

  application_email text,

  status text not null default 'draft' check (
    status in (
      'draft',
      'published',
      'closed',
      'archived'
    )
  ),

  published_at timestamptz,
  closes_at timestamptz,

  created_by uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists careers_jobs_status_idx
  on public.careers_jobs(status);

create index if not exists careers_jobs_department_idx
  on public.careers_jobs(department);

create index if not exists careers_jobs_published_at_idx
  on public.careers_jobs(published_at desc);


-- ------------------------------------------------------------
-- APPLICATIONS
-- ------------------------------------------------------------

create table if not exists public.careers_applications (
  id uuid primary key default gen_random_uuid(),

  job_id uuid references public.careers_jobs(id) on delete set null,

  application_type text not null default 'job' check (
    application_type in (
      'job',
      'spontaneous'
    )
  ),

  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,

  location text,

  linkedin_url text,
  portfolio_url text,

  cv_url text,
  cover_letter text,

  department_interest text check (
    department_interest is null or
    department_interest in (
      'music',
      'creative',
      'business',
      'tech_digital',
      'multiple'
    )
  ),

  availability text,

  status text not null default 'new' check (
    status in (
      'new',
      'review',
      'interview',
      'selected',
      'rejected'
    )
  ),

  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists careers_applications_job_idx
  on public.careers_applications(job_id);

create index if not exists careers_applications_status_idx
  on public.careers_applications(status);

create index if not exists careers_applications_type_idx
  on public.careers_applications(application_type);

create index if not exists careers_applications_created_at_idx
  on public.careers_applications(created_at desc);


-- ------------------------------------------------------------
-- UPDATED_AT
-- ------------------------------------------------------------

create or replace function public.set_careers_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists careers_jobs_updated_at
  on public.careers_jobs;

create trigger careers_jobs_updated_at
before update on public.careers_jobs
for each row
execute function public.set_careers_updated_at();


drop trigger if exists careers_applications_updated_at
  on public.careers_applications;

create trigger careers_applications_updated_at
before update on public.careers_applications
for each row
execute function public.set_careers_updated_at();


-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.careers_jobs enable row level security;
alter table public.careers_applications enable row level security;


-- Public can only read published jobs
drop policy if exists "Public can read published careers jobs"
  on public.careers_jobs;

create policy "Public can read published careers jobs"
on public.careers_jobs
for select
to anon, authenticated
using (
  status = 'published'
  and (published_at is null or published_at <= now())
  and (closes_at is null or closes_at > now())
);


-- Public can submit applications
drop policy if exists "Public can submit careers applications"
  on public.careers_applications;

create policy "Public can submit careers applications"
on public.careers_applications
for insert
to anon, authenticated
with check (
  status = 'new'
  and internal_notes is null
);


-- ------------------------------------------------------------
-- GRANTS
-- ------------------------------------------------------------

grant select on public.careers_jobs to anon;
grant select on public.careers_jobs to authenticated;

grant insert on public.careers_applications to anon;
grant insert on public.careers_applications to authenticated;

