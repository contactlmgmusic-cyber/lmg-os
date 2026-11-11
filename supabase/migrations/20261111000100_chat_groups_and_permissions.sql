begin;

alter table public.chat_channels
  add column if not exists description text,
  add column if not exists write_mode text not null default 'all_members',
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists is_archived boolean not null default false;

alter table public.chat_channels
  drop constraint if exists chat_channels_write_mode_check;

alter table public.chat_channels
  add constraint chat_channels_write_mode_check
  check (write_mode in ('all_members', 'selected_members', 'super_admin_only'));

create table if not exists public.chat_channel_members (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  can_write boolean not null default true,
  added_at timestamptz not null default now(),
  unique (channel_id, user_id)
);

create index if not exists chat_channel_members_channel_id_idx
  on public.chat_channel_members(channel_id);
create index if not exists chat_channel_members_user_id_idx
  on public.chat_channel_members(user_id);

-- Reprend les accès des canaux existants avant de passer aux membres explicites.
insert into public.chat_channel_members (channel_id, user_id, can_write)
select distinct cc.id, p.id, true
from public.chat_channels cc
join public.profiles p on p.role = any(cc.allowed_roles)
where
  p.role in ('super_admin', 'admin', 'artistic_director')
  or (
    p.role = 'manager'
    and (
      (cc.artiste_id is null and cc.projet_id is null)
      or exists (
        select 1 from public.artistes a
        where a.id = cc.artiste_id and a.manager_id = p.id
      )
      or exists (
        select 1 from public.projets pr
        join public.artistes a on a.id = pr.artiste_id
        where pr.id = cc.projet_id and a.manager_id = p.id
      )
    )
  )
  or (
    p.role = 'artiste'
    and (
      p.artiste_id = cc.artiste_id
      or exists (
        select 1 from public.projets pr
        where pr.id = cc.projet_id and pr.artiste_id = p.artiste_id
      )
    )
  )
on conflict (channel_id, user_id) do nothing;

alter table public.chat_channel_members enable row level security;

create or replace function private.lmg_is_chat_member(target_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.lmg_role() = 'super_admin'
    or exists (
      select 1
      from public.chat_channel_members member
      where member.channel_id = target_channel_id
        and member.user_id = auth.uid()
    );
$$;

create or replace function private.lmg_can_write_chat(target_channel_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_channels channel
    where channel.slug = target_channel_slug
      and channel.is_archived = false
      and (
        private.lmg_role() = 'super_admin'
        or (
          channel.write_mode <> 'super_admin_only'
          and exists (
            select 1
            from public.chat_channel_members member
            where member.channel_id = channel.id
              and member.user_id = auth.uid()
              and (
                channel.write_mode = 'all_members'
                or member.can_write = true
              )
          )
        )
      )
  );
$$;

revoke all on function private.lmg_is_chat_member(uuid) from public;
revoke all on function private.lmg_can_write_chat(text) from public;
grant execute on function private.lmg_is_chat_member(uuid) to authenticated;
grant execute on function private.lmg_can_write_chat(text) to authenticated;

-- Les créations automatiques déjà utilisées par les fiches Artiste/Projet restent compatibles.
create or replace function private.lmg_prepare_chat_channel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function private.lmg_seed_chat_channel_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_artist_id uuid;
begin
  target_artist_id := coalesce(
    new.artiste_id,
    (select projet.artiste_id from public.projets projet where projet.id = new.projet_id)
  );

  insert into public.chat_channel_members (channel_id, user_id, can_write)
  select new.id, profile.id, true
  from public.profiles profile
  where
    profile.role in ('super_admin', 'admin', 'artistic_director')
    or profile.artiste_id = target_artist_id
    or exists (
      select 1 from public.artistes artist
      where artist.id = target_artist_id and artist.manager_id = profile.id
    )
  on conflict (channel_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists prepare_chat_channel on public.chat_channels;
create trigger prepare_chat_channel
before insert on public.chat_channels
for each row execute function private.lmg_prepare_chat_channel();

drop trigger if exists seed_chat_channel_members on public.chat_channels;
create trigger seed_chat_channel_members
after insert on public.chat_channels
for each row execute function private.lmg_seed_chat_channel_members();

drop policy if exists "chat_channels_select_scoped" on public.chat_channels;
drop policy if exists "chat_channels_insert_scoped" on public.chat_channels;
drop policy if exists "chat_channels_update_scoped" on public.chat_channels;
drop policy if exists "chat_channels_delete_admin" on public.chat_channels;

create policy "chat_channels_select_members"
on public.chat_channels for select to authenticated
using (private.lmg_is_chat_member(id));

create policy "chat_channels_insert_super_admin"
on public.chat_channels for insert to authenticated
with check (
  created_by = auth.uid()
  and (
    private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
    or (
      private.lmg_role() = 'manager'
      and (
        exists (
          select 1 from public.artistes artist
          where artist.id = chat_channels.artiste_id and artist.manager_id = auth.uid()
        )
        or exists (
          select 1 from public.projets projet
          join public.artistes artist on artist.id = projet.artiste_id
          where projet.id = chat_channels.projet_id and artist.manager_id = auth.uid()
        )
      )
    )
  )
);

create policy "chat_channels_update_super_admin"
on public.chat_channels for update to authenticated
using (private.lmg_role() = 'super_admin')
with check (private.lmg_role() = 'super_admin');

create policy "chat_channels_delete_super_admin"
on public.chat_channels for delete to authenticated
using (private.lmg_role() = 'super_admin');

drop policy if exists "chat_channel_members_select" on public.chat_channel_members;
drop policy if exists "chat_channel_members_manage" on public.chat_channel_members;

create policy "chat_channel_members_select"
on public.chat_channel_members for select to authenticated
using (private.lmg_is_chat_member(channel_id));

create policy "chat_channel_members_manage"
on public.chat_channel_members for all to authenticated
using (private.lmg_role() = 'super_admin')
with check (private.lmg_role() = 'super_admin');

drop policy if exists "chat_messages_select_scoped" on public.chat_messages;
drop policy if exists "chat_messages_insert_scoped" on public.chat_messages;
drop policy if exists "chat_messages_update_own" on public.chat_messages;
drop policy if exists "chat_messages_delete_scoped" on public.chat_messages;

create policy "chat_messages_select_members"
on public.chat_messages for select to authenticated
using (
  exists (
    select 1 from public.chat_channels channel
    where channel.slug = chat_messages.channel
      and private.lmg_is_chat_member(channel.id)
  )
);

create policy "chat_messages_insert_writers"
on public.chat_messages for insert to authenticated
with check (
  user_id = auth.uid()
  and private.lmg_can_write_chat(channel)
);

create policy "chat_messages_update_own"
on public.chat_messages for update to authenticated
using (user_id = auth.uid() and private.lmg_can_write_chat(channel))
with check (user_id = auth.uid() and private.lmg_can_write_chat(channel));

create policy "chat_messages_delete_own_or_super_admin"
on public.chat_messages for delete to authenticated
using (user_id = auth.uid() or private.lmg_role() = 'super_admin');

grant select, insert, update, delete on public.chat_channel_members to authenticated;

create or replace function private.lmg_notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare channel_row public.chat_channels%rowtype;
declare sender_name text;
begin
  select * into channel_row from public.chat_channels where slug = new.channel;
  select coalesce(nom, full_name, 'Un membre') into sender_name
  from public.profiles where id = new.user_id;

  insert into public.notifications
    (user_id, created_by, type, titre, description, lien, niveau, lu, is_read)
  select member.user_id, new.user_id, 'Chat',
         'Nouveau message dans #' || channel_row.name,
         sender_name || ' : ' || left(new.message, 80),
         '/chat?channel=' || channel_row.slug,
         'Info', false, false
  from public.chat_channel_members member
  where member.channel_id = channel_row.id
    and member.user_id <> new.user_id;

  return new;
end;
$$;

drop trigger if exists notify_chat_message on public.chat_messages;
create trigger notify_chat_message
after insert on public.chat_messages
for each row execute function private.lmg_notify_chat_message();

commit;
