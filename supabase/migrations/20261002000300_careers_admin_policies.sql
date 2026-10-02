-- ============================================================
-- LMG CAREERS
-- Admin / Super Admin permissions
-- ============================================================

-- Les utilisateurs authentifiés doivent avoir les privilèges SQL
-- avant que les policies RLS puissent s'appliquer.

grant select, insert, update, delete
on table public.careers_jobs
to authenticated;

grant select, update, delete
on table public.careers_applications
to authenticated;


-- ------------------------------------------------------------
-- JOBS — ADMIN READ
-- ------------------------------------------------------------

drop policy if exists "Careers admins can read all jobs"
on public.careers_jobs;

create policy "Careers admins can read all jobs"
on public.careers_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- JOBS — ADMIN INSERT
-- ------------------------------------------------------------

drop policy if exists "Careers admins can create jobs"
on public.careers_jobs;

create policy "Careers admins can create jobs"
on public.careers_jobs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- JOBS — ADMIN UPDATE
-- ------------------------------------------------------------

drop policy if exists "Careers admins can update jobs"
on public.careers_jobs;

create policy "Careers admins can update jobs"
on public.careers_jobs
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- JOBS — ADMIN DELETE
-- ------------------------------------------------------------

drop policy if exists "Careers admins can delete jobs"
on public.careers_jobs;

create policy "Careers admins can delete jobs"
on public.careers_jobs
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- APPLICATIONS — ADMIN READ
-- ------------------------------------------------------------

drop policy if exists "Careers admins can read applications"
on public.careers_applications;

create policy "Careers admins can read applications"
on public.careers_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- APPLICATIONS — ADMIN UPDATE
-- ------------------------------------------------------------

drop policy if exists "Careers admins can update applications"
on public.careers_applications;

create policy "Careers admins can update applications"
on public.careers_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);


-- ------------------------------------------------------------
-- APPLICATIONS — ADMIN DELETE
-- ------------------------------------------------------------

drop policy if exists "Careers admins can delete applications"
on public.careers_applications;

create policy "Careers admins can delete applications"
on public.careers_applications
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

