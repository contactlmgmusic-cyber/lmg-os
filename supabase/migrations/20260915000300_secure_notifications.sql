begin;

alter table public.notifications
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.notifications
  alter column created_by set default auth.uid();

alter table public.notifications enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "notifications_insert_authenticated"
on public.notifications
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.profiles recipient
    where recipient.id = notifications.user_id
  )
);

create policy "notifications_update_own_or_admin"
on public.notifications
for update
to authenticated
using (
  user_id = auth.uid()
  or private.lmg_role() in ('super_admin', 'admin')
)
with check (
  user_id = auth.uid()
  or private.lmg_role() in ('super_admin', 'admin')
);

create policy "notifications_delete_own_or_admin"
on public.notifications
for delete
to authenticated
using (
  user_id = auth.uid()
  or private.lmg_role() in ('super_admin', 'admin')
);

create or replace function private.lmg_protect_notification_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.lmg_role() not in ('super_admin', 'admin')
    and (
      new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.type is distinct from old.type
      or new.titre is distinct from old.titre
      or new.description is distinct from old.description
      or new.link is distinct from old.link
      or new.lien is distinct from old.lien
      or new.niveau is distinct from old.niveau
      or new.created_at is distinct from old.created_at
      or new.created_by is distinct from old.created_by
    )
  then
    raise exception 'Seul le statut de lecture peut être modifié.';
  end if;

  return new;
end;
$$;

revoke all on function private.lmg_protect_notification_update() from public;

drop trigger if exists protect_notification_update on public.notifications;
create trigger protect_notification_update
before update on public.notifications
for each row
execute function private.lmg_protect_notification_update();

commit;
