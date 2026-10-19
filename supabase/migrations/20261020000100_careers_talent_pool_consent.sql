begin;

alter table public.careers_applications
  add column if not exists talent_pool_consent boolean not null default false,
  add column if not exists talent_pool_consented_at timestamptz;

alter table public.careers_applications
  drop constraint if exists careers_talent_pool_consent_consistency;

alter table public.careers_applications
  add constraint careers_talent_pool_consent_consistency check (
    (talent_pool_consent is true and talent_pool_consented_at is not null)
    or
    (talent_pool_consent is false and talent_pool_consented_at is null)
  );

comment on column public.careers_applications.talent_pool_consent is
  'Explicit optional consent to retain the candidate profile in the LMG talent pool.';

comment on column public.careers_applications.talent_pool_consented_at is
  'Timestamp at which talent pool consent was given.';

commit;
