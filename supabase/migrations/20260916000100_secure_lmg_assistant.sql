begin;

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  sources jsonb not null default '[]'::jsonb,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists assistant_conversations_user_updated_idx
  on public.assistant_conversations(user_id, updated_at desc);
create index if not exists assistant_messages_conversation_created_idx
  on public.assistant_messages(conversation_id, created_at);

alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;

do $$
declare policy_row record;
begin
  for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = 'assistant_conversations'
  loop execute format('drop policy if exists %I on public.assistant_conversations', policy_row.policyname); end loop;
  for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = 'assistant_messages'
  loop execute format('drop policy if exists %I on public.assistant_messages', policy_row.policyname); end loop;
end $$;

create policy assistant_conversations_owner on public.assistant_conversations
for all to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and private.lmg_role() in ('super_admin', 'admin', 'artistic_director', 'manager')
);

create policy assistant_messages_owner_select on public.assistant_messages
for select to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

create policy assistant_messages_owner_insert on public.assistant_messages
for insert to authenticated
with check (
  user_id = auth.uid()
  and private.lmg_role() in ('super_admin', 'admin', 'artistic_director', 'manager')
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

create policy assistant_messages_owner_delete on public.assistant_messages
for delete to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

revoke all on public.assistant_conversations from anon;
revoke all on public.assistant_messages from anon;
grant select, insert, update, delete on public.assistant_conversations to authenticated;
grant select, insert, delete on public.assistant_messages to authenticated;

commit;
