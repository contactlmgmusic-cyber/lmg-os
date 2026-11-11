begin;

alter table public.chat_channels
  add column if not exists group_kind text not null default 'custom';

update public.chat_channels
set group_kind = case
  when type in ('artist', 'artiste') then 'artist'
  when type = 'direction' then 'direction'
  when type = 'staff' then 'staff'
  else 'custom'
end
where group_kind = 'custom';

alter table public.chat_channels
  drop constraint if exists chat_channels_group_kind_check;

alter table public.chat_channels
  add constraint chat_channels_group_kind_check
  check (group_kind in ('staff', 'artist', 'direction', 'custom'));

commit;
