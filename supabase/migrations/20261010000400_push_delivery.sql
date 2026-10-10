begin;

create table if not exists public.app_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

create extension if not exists pg_net with schema extensions;

create or replace function private.lmg_dispatch_push_notifications()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  push_secret text;
begin
  select value into push_secret from public.app_secrets where key = 'push_cron_secret';
  if push_secret is null then return; end if;

  perform net.http_get(
    url := 'https://lmg-os-git-feat-lmg-admin-mobile-legacy-music-group.vercel.app/api/cron/push-notifications',
    headers := jsonb_build_object('Authorization', 'Bearer ' || push_secret),
    timeout_milliseconds := 15000
  );
end;
$$;

revoke all on function private.lmg_dispatch_push_notifications() from public, anon, authenticated;

do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'lmg-push-notifications';
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
  perform cron.schedule('lmg-push-notifications', '*/5 * * * *', 'select private.lmg_dispatch_push_notifications();');
end $$;

commit;
