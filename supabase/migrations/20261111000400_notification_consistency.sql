begin;

-- Une seule source de vérité, tout en conservant les deux colonnes historiques.
update public.notifications
set
  is_read = coalesce(is_read, false) or coalesce(lu, false),
  lu = coalesce(is_read, false) or coalesce(lu, false)
where is_read is distinct from lu
   or is_read is null
   or lu is null;

alter table public.notifications alter column is_read set default false;
alter table public.notifications alter column lu set default false;

create or replace function private.lmg_sync_notification_read_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare read_value boolean;
begin
  if tg_op = 'UPDATE' and new.is_read is distinct from old.is_read then
    read_value := coalesce(new.is_read, false);
  elsif tg_op = 'UPDATE' and new.lu is distinct from old.lu then
    read_value := coalesce(new.lu, false);
  else
    read_value := coalesce(new.is_read, false) or coalesce(new.lu, false);
  end if;

  new.is_read := read_value;
  new.lu := read_value;
  return new;
end;
$$;

drop trigger if exists sync_notification_read_state on public.notifications;
create trigger sync_notification_read_state
before insert or update on public.notifications
for each row execute function private.lmg_sync_notification_read_state();

-- Un chat = une alerte non lue par destinataire. Les nouveaux messages actualisent l’alerte.
create or replace function private.lmg_notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare channel_row public.chat_channels%rowtype;
declare sender_name text;
declare recipient record;
declare target_link text;
begin
  select * into channel_row from public.chat_channels where slug = new.channel;
  if channel_row.id is null then return new; end if;

  select coalesce(nom, full_name, 'Un membre') into sender_name
  from public.profiles where id = new.user_id;
  target_link := '/chat?channel=' || channel_row.slug;

  for recipient in
    select member.user_id
    from public.chat_channel_members member
    where member.channel_id = channel_row.id
      and member.user_id <> new.user_id
  loop
    update public.notifications
    set
      created_by = new.user_id,
      titre = 'Nouveau message dans ' || channel_row.name,
      description = sender_name || ' : ' || left(new.message, 100),
      niveau = 'Info',
      created_at = now(),
      lu = false,
      is_read = false
    where user_id = recipient.user_id
      and type = 'Chat'
      and coalesce(link, lien) = target_link
      and coalesce(is_read, false) = false;

    if not found then
      insert into public.notifications
        (user_id, created_by, type, titre, description, lien, link, niveau, lu, is_read)
      values
        (recipient.user_id, new.user_id, 'Chat',
         'Nouveau message dans ' || channel_row.name,
         sender_name || ' : ' || left(new.message, 100),
         target_link, target_link, 'Info', false, false);
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_chat_message on public.chat_messages;
create trigger notify_chat_message
after insert on public.chat_messages
for each row execute function private.lmg_notify_chat_message();

grant select, update on public.notifications to authenticated;

commit;

notify pgrst, 'reload schema';
