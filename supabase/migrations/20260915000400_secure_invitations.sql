alter table public.invitations
  add column if not exists token_hash text,
  add column if not exists expires_at timestamptz,
  add column if not exists accepted_at timestamptz;

create unique index if not exists invitations_token_hash_key
  on public.invitations (token_hash)
  where token_hash is not null;

alter table public.invitations enable row level security;

drop policy if exists "Admins manage invitations" on public.invitations;
create policy "Admins manage invitations"
on public.invitations
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('super_admin', 'admin')
  )
);

revoke all on table public.invitations from anon;
grant select, insert, update, delete on table public.invitations to authenticated;

