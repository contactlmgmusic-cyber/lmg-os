begin;

drop policy if exists "chat_channels_insert_scoped" on public.chat_channels;
drop policy if exists "chat_channels_insert_super_admin" on public.chat_channels;
drop policy if exists "chat_channels_update_scoped" on public.chat_channels;
drop policy if exists "chat_channels_update_super_admin" on public.chat_channels;
drop policy if exists "chat_channels_delete_admin" on public.chat_channels;
drop policy if exists "chat_channels_delete_super_admin" on public.chat_channels;

create policy "chat_channels_insert_super_admin"
on public.chat_channels
for insert
to authenticated
with check (
  private.lmg_role() = 'super_admin'
  and created_by = auth.uid()
);

create policy "chat_channels_update_super_admin"
on public.chat_channels
for update
to authenticated
using (private.lmg_role() = 'super_admin')
with check (private.lmg_role() = 'super_admin');

create policy "chat_channels_delete_super_admin"
on public.chat_channels
for delete
to authenticated
using (private.lmg_role() = 'super_admin');

grant select, insert, update, delete on public.chat_channels to authenticated;
grant select, insert, update, delete on public.chat_channel_members to authenticated;

commit;

notify pgrst, 'reload schema';
