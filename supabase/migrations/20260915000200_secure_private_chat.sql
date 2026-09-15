begin;

alter table public.private_conversations
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.private_conversations
  alter column created_by set default auth.uid();

create or replace function private.lmg_is_private_conversation_member(conversation_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.private_conversation_members member
    where member.conversation_id = conversation_uuid
      and member.user_id = auth.uid()
  );
$$;

revoke all on function private.lmg_is_private_conversation_member(uuid) from public;
grant execute on function private.lmg_is_private_conversation_member(uuid) to authenticated;

alter table public.private_conversations enable row level security;
alter table public.private_conversation_members enable row level security;
alter table public.private_messages enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'private_conversations',
        'private_conversation_members',
        'private_messages'
      )
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

drop policy if exists "private_conversations_select_member" on public.private_conversations;
drop policy if exists "private_conversations_insert_authenticated" on public.private_conversations;
drop policy if exists "private_conversations_delete_creator" on public.private_conversations;

create policy "private_conversations_select_member"
on public.private_conversations
for select
to authenticated
using (
  created_by = auth.uid()
  or private.lmg_is_private_conversation_member(id)
);

create policy "private_conversations_insert_authenticated"
on public.private_conversations
for insert
to authenticated
with check (created_by = auth.uid());

create policy "private_conversations_delete_creator"
on public.private_conversations
for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists "private_members_select_conversation" on public.private_conversation_members;
drop policy if exists "private_members_insert_creator" on public.private_conversation_members;
drop policy if exists "private_members_delete_scoped" on public.private_conversation_members;

create policy "private_members_select_conversation"
on public.private_conversation_members
for select
to authenticated
using (
  user_id = auth.uid()
  or private.lmg_is_private_conversation_member(conversation_id)
  or exists (
    select 1
    from public.private_conversations conversation
    where conversation.id = private_conversation_members.conversation_id
      and conversation.created_by = auth.uid()
  )
);

create policy "private_members_insert_creator"
on public.private_conversation_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.private_conversations conversation
    where conversation.id = private_conversation_members.conversation_id
      and conversation.created_by = auth.uid()
  )
);

create policy "private_members_delete_scoped"
on public.private_conversation_members
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.private_conversations conversation
    where conversation.id = private_conversation_members.conversation_id
      and conversation.created_by = auth.uid()
  )
);

drop policy if exists "private_messages_select_member" on public.private_messages;
drop policy if exists "private_messages_insert_member" on public.private_messages;
drop policy if exists "private_messages_update_recipient" on public.private_messages;
drop policy if exists "private_messages_delete_sender" on public.private_messages;

create policy "private_messages_select_member"
on public.private_messages
for select
to authenticated
using (private.lmg_is_private_conversation_member(conversation_id));

create policy "private_messages_insert_member"
on public.private_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and private.lmg_is_private_conversation_member(conversation_id)
);

create policy "private_messages_update_recipient"
on public.private_messages
for update
to authenticated
using (
  sender_id <> auth.uid()
  and private.lmg_is_private_conversation_member(conversation_id)
)
with check (
  sender_id <> auth.uid()
  and private.lmg_is_private_conversation_member(conversation_id)
);

create or replace function private.lmg_protect_private_message_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.conversation_id is distinct from old.conversation_id
    or new.sender_id is distinct from old.sender_id
    or new.message is distinct from old.message
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Seul le statut de lecture peut être modifié.';
  end if;

  return new;
end;
$$;

revoke all on function private.lmg_protect_private_message_update() from public;

drop trigger if exists protect_private_message_update on public.private_messages;
create trigger protect_private_message_update
before update on public.private_messages
for each row
execute function private.lmg_protect_private_message_update();

create policy "private_messages_delete_sender"
on public.private_messages
for delete
to authenticated
using (
  sender_id = auth.uid()
  and private.lmg_is_private_conversation_member(conversation_id)
);

commit;
