begin;
-- Submissions go through the validated server route, never the anonymous REST/storage API.
drop policy if exists "careers public cv upload" on storage.objects;
drop policy if exists "Public can submit careers applications" on public.careers_applications;
revoke insert on public.careers_applications from anon, authenticated;
update storage.buckets set file_size_limit = 4194304 where id = 'careers-cv';

create table if not exists private.careers_submission_quota (
  key text primary key,
  window_start timestamptz not null,
  attempts integer not null default 0
);
revoke all on private.careers_submission_quota from public, anon, authenticated;
create or replace function public.consume_careers_submission_quota(client_key text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare bucket timestamptz := date_trunc('hour', now()); client_count integer; global_count integer;
begin
  if client_key !~ '^[a-f0-9]{64}$' then return false; end if;
  perform pg_advisory_xact_lock(hashtext('lmg-careers-quota'));
  delete from private.careers_submission_quota where window_start < bucket - interval '2 hours';
  insert into private.careers_submission_quota(key, window_start, attempts) values (client_key, bucket, 1)
  on conflict(key) do update set attempts = case when careers_submission_quota.window_start = bucket then careers_submission_quota.attempts + 1 else 1 end, window_start = bucket
  returning attempts into client_count;
  if client_count > 5 then return false; end if;
  insert into private.careers_submission_quota(key, window_start, attempts) values ('global', bucket, 1)
  on conflict(key) do update set attempts = case when careers_submission_quota.window_start = bucket then careers_submission_quota.attempts + 1 else 1 end, window_start = bucket
  returning attempts into global_count;
  return client_count <= 5 and global_count <= 100;
end;
$$;
revoke all on function public.consume_careers_submission_quota(text) from public, anon, authenticated;
grant execute on function public.consume_careers_submission_quota(text) to service_role;

alter table public.invitations add column if not exists claim_id uuid;
alter table public.invitations add column if not exists claimed_at timestamptz;
alter table public.invitations add column if not exists accepted_user_id uuid references auth.users(id) on delete set null;
create or replace function public.claim_lmg_invitation(invitation_hash text, claim uuid)
returns table(id uuid, email text, role text) language sql security definer set search_path = '' as $$
  update public.invitations set claim_id = claim, claimed_at = now()
  where token_hash = invitation_hash and status = 'pending' and expires_at > now() and claim_id is null
  returning invitations.id, invitations.email, invitations.role;
$$;
create or replace function public.complete_lmg_invitation(invitation_id uuid, claim uuid, account_id uuid, account_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare invite public.invitations;
begin
  select * into invite from public.invitations where id = invitation_id and claim_id = claim and status = 'pending' for update;
  if not found then raise exception 'Invitation unavailable'; end if;
  if invite.role not in ('admin','manager','artistic_director','artiste','prestataire') then raise exception 'Invalid invitation role'; end if;
  insert into public.profiles(id, email, nom, role) values (account_id, invite.email, account_name, invite.role)
  on conflict(id) do update set email = excluded.email, nom = excluded.nom, role = excluded.role;
  update public.invitations set status = 'accepted', accepted_at = now(), accepted_user_id = account_id, token_hash = null, claim_id = null, claimed_at = null where id = invitation_id;
end;
$$;
revoke all on function public.claim_lmg_invitation(text, uuid) from public, anon, authenticated;
revoke all on function public.complete_lmg_invitation(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_lmg_invitation(text, uuid) to service_role;
grant execute on function public.complete_lmg_invitation(uuid, uuid, uuid, text) to service_role;

-- Remove only the explicitly identified test vacancy from public listings; keep its record.
update public.careers_jobs set status = 'draft'
where slug = 'assistant-e-de-communication' and short_description = 'Offre test pour LMG Careers.';
commit;
