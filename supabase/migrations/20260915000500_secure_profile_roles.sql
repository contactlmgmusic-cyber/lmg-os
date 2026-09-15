create or replace function private.lmg_protect_profile_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    raise exception 'Vous ne pouvez pas modifier votre propre rôle.';
  end if;

  if (old.role = 'super_admin' or new.role = 'super_admin')
     and coalesce(private.lmg_role(), '') <> 'super_admin' then
    raise exception 'Seul un Super Admin peut modifier ce rôle.';
  end if;

  if old.role = 'super_admin' and new.role is distinct from 'super_admin'
     and (select count(*) from public.profiles where role = 'super_admin') <= 1 then
    raise exception 'Le dernier Super Admin doit être conservé.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_roles on public.profiles;
create trigger protect_profile_roles
before update of role on public.profiles
for each row execute function private.lmg_protect_profile_roles();

