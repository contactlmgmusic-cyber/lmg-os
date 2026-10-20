begin;

grant delete
  on table public.careers_applications
  to service_role;

commit;
