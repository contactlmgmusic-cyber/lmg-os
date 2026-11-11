begin;

-- Une conversation privée = une seule alerte non lue par destinataire.
-- Chaque nouveau message actualise l'alerte existante au lieu de l'empiler.
create or replace function private.lmg_notify_private_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare sender_name text;
declare recipient record;
declare target_link text;
begin
  select coalesce(nom, full_name, 'Un membre')
  into sender_name
  from public.profiles
  where id = new.sender_id;

  target_link := '/chat/prive/conversation/' || new.conversation_id::text;

  for recipient in
    select member.user_id
    from public.private_conversation_members member
    where member.conversation_id = new.conversation_id
      and member.user_id <> new.sender_id
  loop
    update public.notifications
    set
      created_by = new.sender_id,
      titre = 'Nouveau message privé',
      description = sender_name || ' : ' || left(new.message, 100),
      lien = target_link,
      link = target_link,
      niveau = 'Info',
      created_at = now(),
      lu = false,
      is_read = false
    where user_id = recipient.user_id
      and type = 'Chat'
      and coalesce(link, lien) in (
        target_link,
        '/mobile/messages/prives/conversation/' || new.conversation_id::text
      )
      and coalesce(is_read, false) = false;

    if not found then
      insert into public.notifications
        (user_id, created_by, type, titre, description, lien, link, niveau, lu, is_read)
      values
        (recipient.user_id, new.sender_id, 'Chat', 'Nouveau message privé',
         sender_name || ' : ' || left(new.message, 100),
         target_link, target_link, 'Info', false, false);
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_private_message on public.private_messages;
create trigger notify_private_message
after insert on public.private_messages
for each row execute function private.lmg_notify_private_message();

commit;

notify pgrst, 'reload schema';
