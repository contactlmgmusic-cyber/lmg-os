begin;

-- Public applications are handled by the validated server route. The service
-- role still needs explicit SQL privileges; bypassing RLS alone is not enough.
grant select, insert
  on table public.careers_applications
  to service_role;

grant select
  on table public.careers_jobs, public.profiles
  to service_role;

grant insert
  on table public.notifications
  to service_role;

commit;
