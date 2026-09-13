begin;

alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_channels_select_scoped" on public.chat_channels;
drop policy if exists "chat_channels_insert_scoped" on public.chat_channels;
drop policy if exists "chat_channels_update_scoped" on public.chat_channels;
drop policy if exists "chat_channels_delete_admin" on public.chat_channels;

create policy "chat_channels_select_scoped"
on public.chat_channels
for select
to authenticated
using (
  private.lmg_role() = any(allowed_roles)
  and (
    private.lmg_role() in ('super_admin', 'admin')
    or (
      private.lmg_role() = 'manager'
      and (
        (artiste_id is null and projet_id is null)
        or exists (
          select 1
          from public.artistes a
          where a.id = chat_channels.artiste_id
            and a.manager_id = auth.uid()
        )
        or exists (
          select 1
          from public.projets p
          join public.artistes a on a.id = p.artiste_id
          where p.id = chat_channels.projet_id
            and a.manager_id = auth.uid()
        )
      )
    )
  )
);

create policy "chat_channels_insert_scoped"
on public.chat_channels
for insert
to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and private.lmg_role() = any(allowed_roles)
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = chat_channels.artiste_id
          and a.manager_id = auth.uid()
      )
      or exists (
        select 1
        from public.projets p
        join public.artistes a on a.id = p.artiste_id
        where p.id = chat_channels.projet_id
          and a.manager_id = auth.uid()
      )
    )
  )
);

create policy "chat_channels_update_scoped"
on public.chat_channels
for update
to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = chat_channels.artiste_id
          and a.manager_id = auth.uid()
      )
      or exists (
        select 1
        from public.projets p
        join public.artistes a on a.id = p.artiste_id
        where p.id = chat_channels.projet_id
          and a.manager_id = auth.uid()
      )
    )
  )
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'manager'
    and private.lmg_role() = any(allowed_roles)
    and (
      exists (
        select 1
        from public.artistes a
        where a.id = chat_channels.artiste_id
          and a.manager_id = auth.uid()
      )
      or exists (
        select 1
        from public.projets p
        join public.artistes a on a.id = p.artiste_id
        where p.id = chat_channels.projet_id
          and a.manager_id = auth.uid()
      )
    )
  )
);

create policy "chat_channels_delete_admin"
on public.chat_channels
for delete
to authenticated
using (private.lmg_role() in ('super_admin', 'admin'));

drop policy if exists "chat_messages_select_scoped" on public.chat_messages;
drop policy if exists "chat_messages_insert_scoped" on public.chat_messages;
drop policy if exists "chat_messages_update_own" on public.chat_messages;
drop policy if exists "chat_messages_delete_scoped" on public.chat_messages;

create policy "chat_messages_select_scoped"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_channels cc
    where cc.slug = chat_messages.channel
  )
);

create policy "chat_messages_insert_scoped"
on public.chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_channels cc
    where cc.slug = chat_messages.channel
  )
);

create policy "chat_messages_update_own"
on public.chat_messages
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_channels cc
    where cc.slug = chat_messages.channel
  )
);

create policy "chat_messages_delete_scoped"
on public.chat_messages
for delete
to authenticated
using (
  user_id = auth.uid()
  or private.lmg_role() in ('super_admin', 'admin')
);

commit;
