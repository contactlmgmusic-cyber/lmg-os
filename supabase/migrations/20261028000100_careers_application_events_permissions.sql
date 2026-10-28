begin;

-- RLS decides which authenticated users may read the audit trail, but the
-- underlying table privilege is still required before PostgreSQL evaluates
-- the policy. Keep this migration idempotent for databases where the original
-- workflow migration was only partially applied.
grant select
  on table public.careers_application_events
  to authenticated;

drop policy if exists "Careers admins can read application events"
  on public.careers_application_events;

create policy "Careers admins can read application events"
on public.careers_application_events
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

commit;
