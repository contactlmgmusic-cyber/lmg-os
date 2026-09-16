begin;

drop policy if exists assistant_conversations_owner on public.assistant_conversations;
drop policy if exists assistant_messages_owner_select on public.assistant_messages;
drop policy if exists assistant_messages_owner_insert on public.assistant_messages;
drop policy if exists assistant_messages_owner_delete on public.assistant_messages;

create policy assistant_conversations_super_admin on public.assistant_conversations
for all to authenticated
using (user_id = auth.uid() and private.lmg_role() = 'super_admin')
with check (user_id = auth.uid() and private.lmg_role() = 'super_admin');

create policy assistant_messages_super_admin_select on public.assistant_messages
for select to authenticated
using (
  user_id = auth.uid()
  and private.lmg_role() = 'super_admin'
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

create policy assistant_messages_super_admin_insert on public.assistant_messages
for insert to authenticated
with check (
  user_id = auth.uid()
  and private.lmg_role() = 'super_admin'
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

create policy assistant_messages_super_admin_delete on public.assistant_messages
for delete to authenticated
using (
  user_id = auth.uid()
  and private.lmg_role() = 'super_admin'
  and exists (
    select 1 from public.assistant_conversations conversation
    where conversation.id = assistant_messages.conversation_id
      and conversation.user_id = auth.uid()
  )
);

commit;
