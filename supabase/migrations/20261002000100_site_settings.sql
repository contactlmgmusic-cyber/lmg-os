create table if not exists public.site_settings (
  id text primary key,
  maintenance_enabled boolean not null default false,
  maintenance_title_fr text not null default 'Site en maintenance',
  maintenance_title_en text not null default 'Website under maintenance',
  maintenance_message_fr text not null default 'Nous travaillons actuellement sur LMG Music. Revenez très bientôt.',
  maintenance_message_en text not null default 'We are currently working on LMG Music. Please check back soon.',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  id,
  maintenance_enabled
)
values (
  'lmg_music',
  false
)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;

create policy "site_settings_public_read"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "site_settings_admin_update"
on public.site_settings
for update
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_updated_at
on public.site_settings;

create trigger site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_site_settings_updated_at();
