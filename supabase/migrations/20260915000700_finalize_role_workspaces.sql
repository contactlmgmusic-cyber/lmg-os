begin;

-- Tâches : seuls les administrateurs, le créateur et les personnes assignées
-- peuvent voir une tâche. Le rattachement à un artiste ne suffit plus.
alter table public.taches
  add column if not exists created_by uuid references public.profiles(id) on delete set null default auth.uid();

alter table public.task_assignees enable row level security;

drop policy if exists "taches_select_scoped" on public.taches;
drop policy if exists "taches_insert_scoped" on public.taches;
drop policy if exists "taches_update_scoped" on public.taches;
drop policy if exists "taches_delete_scoped" on public.taches;

create policy "taches_select_scoped" on public.taches
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or created_by = auth.uid()
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
);

create policy "taches_insert_scoped" on public.taches
for insert to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() in ('artistic_director', 'manager')
    and created_by = auth.uid()
    and (
      projet_id is null
      or private.lmg_role() = 'artistic_director'
      or private.lmg_project_is_accessible(projet_id)
    )
  )
);

create policy "taches_update_scoped" on public.taches
for update to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or created_by = auth.uid()
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or created_by = auth.uid()
  or responsable_id = auth.uid()
  or assigned_to = auth.uid()
  or private.lmg_is_task_assignee(id)
);

create policy "taches_delete_scoped" on public.taches
for delete to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or created_by = auth.uid()
);

create or replace function private.lmg_protect_assignee_task_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.lmg_role() not in ('super_admin', 'admin')
     and old.created_by is distinct from auth.uid()
     and (to_jsonb(new) - array['statut', 'checklist'])
         is distinct from
         (to_jsonb(old) - array['statut', 'checklist']) then
    raise exception 'Une personne assignée peut uniquement modifier le statut et la checklist.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_assignee_task_update on public.taches;
create trigger protect_assignee_task_update
before update on public.taches
for each row execute function private.lmg_protect_assignee_task_update();

drop policy if exists "task_assignees_select_scoped" on public.task_assignees;
drop policy if exists "task_assignees_insert_scoped" on public.task_assignees;
drop policy if exists "task_assignees_delete_scoped" on public.task_assignees;

create policy "task_assignees_select_scoped" on public.task_assignees
for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.taches t
    where t.id = task_assignees.task_id
      and (
        private.lmg_role() in ('super_admin', 'admin')
        or t.created_by = auth.uid()
        or t.responsable_id = auth.uid()
        or t.assigned_to = auth.uid()
      )
  )
);

create policy "task_assignees_insert_scoped" on public.task_assignees
for insert to authenticated
with check (
  exists (
    select 1 from public.taches t
    where t.id = task_assignees.task_id
      and (private.lmg_role() in ('super_admin', 'admin') or t.created_by = auth.uid())
  )
);

create policy "task_assignees_delete_scoped" on public.task_assignees
for delete to authenticated
using (
  exists (
    select 1 from public.taches t
    where t.id = task_assignees.task_id
      and (private.lmg_role() in ('super_admin', 'admin') or t.created_by = auth.uid())
  )
);

-- Projets internes : Direction artistique uniquement si responsable ou membre.
create or replace function private.lmg_is_internal_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.internal_project_members member
    where member.project_id = target_project_id and member.user_id = auth.uid()
  );
$$;

revoke all on function private.lmg_is_internal_project_member(uuid) from public;
grant execute on function private.lmg_is_internal_project_member(uuid) to authenticated;

drop policy if exists internal_projects_select on public.internal_projects;
drop policy if exists internal_projects_insert on public.internal_projects;
drop policy if exists internal_projects_update on public.internal_projects;

create policy internal_projects_select on public.internal_projects
for select to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (
    private.lmg_role() = 'artistic_director'
    and (owner_id = auth.uid() or private.lmg_is_internal_project_member(id))
  )
);

create policy internal_projects_insert on public.internal_projects
for insert to authenticated
with check (private.lmg_role() in ('super_admin', 'admin'));

create policy internal_projects_update on public.internal_projects
for update to authenticated
using (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'artistic_director' and owner_id = auth.uid())
)
with check (
  private.lmg_role() in ('super_admin', 'admin')
  or (private.lmg_role() = 'artistic_director' and owner_id = auth.uid())
);

do $$
declare table_name text;
begin
  foreach table_name in array array['internal_project_members','internal_project_milestones','internal_project_resources','internal_project_updates']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_team_access', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_scoped', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.lmg_role() in (''super_admin'',''admin'') or private.lmg_is_internal_project_member(project_id)) with check (private.lmg_role() in (''super_admin'',''admin'') or private.lmg_is_internal_project_member(project_id))',
      table_name || '_scoped', table_name
    );
  end loop;
end $$;

-- Chat : aucun canal général pour Manager/Artiste. Seulement leur artiste/projet.
drop policy if exists "chat_channels_select_scoped" on public.chat_channels;
drop policy if exists "chat_channels_insert_scoped" on public.chat_channels;
drop policy if exists "chat_channels_update_scoped" on public.chat_channels;

create policy "chat_channels_select_scoped" on public.chat_channels
for select to authenticated
using (
  private.lmg_role() = any(allowed_roles)
  and (
    private.lmg_role() in ('super_admin', 'admin')
    or private.lmg_role() = 'artistic_director'
    or (
      private.lmg_role() = 'manager'
      and (
        exists (select 1 from public.artistes a where a.id = chat_channels.artiste_id and a.manager_id = auth.uid())
        or exists (
          select 1 from public.projets p join public.artistes a on a.id = p.artiste_id
          where p.id = chat_channels.projet_id and a.manager_id = auth.uid()
        )
      )
    )
    or (
      private.lmg_role() = 'artiste'
      and (
        artiste_id = private.lmg_artist_id()
        or exists (select 1 from public.projets p where p.id = chat_channels.projet_id and p.artiste_id = private.lmg_artist_id())
      )
    )
  )
);

create policy "chat_channels_insert_scoped" on public.chat_channels
for insert to authenticated
with check (
  private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
  or (
    private.lmg_role() = 'manager'
    and artiste_id is not null
    and exists (select 1 from public.artistes a where a.id = chat_channels.artiste_id and a.manager_id = auth.uid())
  )
  or (
    private.lmg_role() = 'manager'
    and projet_id is not null
    and exists (
      select 1 from public.projets p join public.artistes a on a.id = p.artiste_id
      where p.id = chat_channels.projet_id and a.manager_id = auth.uid()
    )
  )
);

create policy "chat_channels_update_scoped" on public.chat_channels
for update to authenticated
using (private.lmg_role() in ('super_admin', 'admin', 'artistic_director'))
with check (private.lmg_role() in ('super_admin', 'admin', 'artistic_director'));

-- Les notifications de canal sont créées par la base selon l’appartenance réelle.
create or replace function private.lmg_notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare channel_row public.chat_channels%rowtype;
declare sender_name text;
begin
  select * into channel_row from public.chat_channels where slug = new.channel;
  select coalesce(nom, 'Un membre') into sender_name from public.profiles where id = new.user_id;

  insert into public.notifications (user_id, created_by, type, titre, description, lien, niveau, lu, is_read)
  select p.id, new.user_id, 'Chat', 'Nouveau message dans #' || channel_row.name,
         sender_name || ' : ' || left(new.message, 80), '/chat?channel=' || channel_row.slug,
         'Info', false, false
  from public.profiles p
  where p.id <> new.user_id
    and p.role = any(channel_row.allowed_roles)
    and (
      p.role in ('super_admin', 'admin', 'artistic_director')
      or (p.role = 'artiste' and p.artiste_id = coalesce(channel_row.artiste_id, (select artiste_id from public.projets where id = channel_row.projet_id)))
      or (p.role = 'manager' and exists (
        select 1 from public.artistes a
        where a.id = coalesce(channel_row.artiste_id, (select artiste_id from public.projets where id = channel_row.projet_id))
          and a.manager_id = p.id
      ))
    );
  return new;
end;
$$;

drop trigger if exists notify_chat_message on public.chat_messages;
create trigger notify_chat_message
after insert on public.chat_messages
for each row execute function private.lmg_notify_chat_message();

-- Le pilotage stratégique LMG est réservé à l'administration.
drop policy if exists company_objectives_team_access on public.company_objectives;
drop policy if exists company_objectives_admin_access on public.company_objectives;
create policy company_objectives_admin_access on public.company_objectives
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

drop policy if exists company_objective_updates_team_access on public.company_objective_updates;
drop policy if exists company_objective_updates_admin_access on public.company_objective_updates;
create policy company_objective_updates_admin_access on public.company_objective_updates
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

drop policy if exists weekly_reviews_team_access on public.weekly_reviews;
drop policy if exists weekly_reviews_admin_access on public.weekly_reviews;
create policy weekly_reviews_admin_access on public.weekly_reviews
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

drop policy if exists weekly_review_decisions_team_access on public.weekly_review_decisions;
drop policy if exists weekly_review_decisions_admin_access on public.weekly_review_decisions;
create policy weekly_review_decisions_admin_access on public.weekly_review_decisions
for all to authenticated
using (private.lmg_role() in ('super_admin', 'admin'))
with check (private.lmg_role() in ('super_admin', 'admin'));

-- Périmètre artistique commun utilisé par les modules opérationnels.
create or replace function private.lmg_can_access_artist(target_artist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.lmg_role() in ('super_admin', 'admin', 'artistic_director')
    or target_artist_id = private.lmg_artist_id()
    or exists (
      select 1 from public.artistes a
      where a.id = target_artist_id and a.manager_id = auth.uid()
    );
$$;

revoke all on function private.lmg_can_access_artist(uuid) from public;
grant execute on function private.lmg_can_access_artist(uuid) to authenticated;

-- Retire les anciennes politiques permissives des tables artistiques auditées.
do $$
declare target_table text;
declare policy_row record;
begin
  foreach target_table in array array[
    'analytics', 'sorties', 'artiste_objectifs', 'artist_approvals',
    'artiste_events', 'medias', 'influenceurs', 'campagnes', 'drive_files'
  ] loop
    execute format('alter table public.%I enable row level security', target_table);
    for policy_row in
      select policyname from pg_policies where schemaname = 'public' and tablename = target_table
    loop
      execute format('drop policy if exists %I on public.%I', policy_row.policyname, target_table);
    end loop;
  end loop;
end $$;

create policy analytics_read_scoped on public.analytics for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy analytics_write_scoped on public.analytics for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy sorties_read_scoped on public.sorties for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy sorties_write_scoped on public.sorties for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy artiste_objectifs_read_scoped on public.artiste_objectifs for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy artiste_objectifs_write_scoped on public.artiste_objectifs for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy artist_approvals_read_scoped on public.artist_approvals for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy artist_approvals_staff_write on public.artist_approvals for insert to authenticated
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));
create policy artist_approvals_staff_update on public.artist_approvals for update to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)) or artiste_id = private.lmg_artist_id())
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)) or artiste_id = private.lmg_artist_id());
create policy artist_approvals_staff_delete on public.artist_approvals for delete to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy artiste_events_read_scoped on public.artiste_events for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy artiste_events_write_scoped on public.artiste_events for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy medias_scoped on public.medias for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));
create policy influenceurs_scoped on public.influenceurs for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));
create policy campagnes_scoped on public.campagnes for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy drive_files_read_scoped on public.drive_files for select to authenticated
using (
  private.lmg_role() in ('super_admin','admin','artistic_director')
  or uploaded_by = auth.uid()
  or (artiste_id is not null and private.lmg_can_access_artist(artiste_id))
  or (projet_id is not null and private.lmg_project_is_accessible(projet_id))
);
create policy drive_files_insert_scoped on public.drive_files for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and private.lmg_role() in ('super_admin','admin','artistic_director','manager')
  and (artiste_id is null or private.lmg_can_access_artist(artiste_id))
  and (projet_id is null or private.lmg_project_is_accessible(projet_id) or private.lmg_role() in ('super_admin','admin','artistic_director'))
);
create policy drive_files_delete_scoped on public.drive_files for delete to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or uploaded_by = auth.uid());

-- Tables secondaires qui alimentent les anciennes sous-pages encore utilisées.
do $$
declare target_table text;
declare policy_row record;
begin
  foreach target_table in array array[
    'objectifs_artiste', 'objectifs_artistes', 'artiste_documents', 'equipe_artiste',
    'prospects_lmg', 'partenaires', 'contract_approvals', 'release_tasks',
    'media_relances', 'commentaires_projets'
  ] loop
    execute format('alter table public.%I enable row level security', target_table);
    for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = target_table loop
      execute format('drop policy if exists %I on public.%I', policy_row.policyname, target_table);
    end loop;
  end loop;
end $$;

create policy objectifs_artiste_read_scoped on public.objectifs_artiste for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy objectifs_artiste_write_scoped on public.objectifs_artiste for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy objectifs_artistes_read_scoped on public.objectifs_artistes for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy objectifs_artistes_write_scoped on public.objectifs_artistes for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy artiste_documents_read_scoped on public.artiste_documents for select to authenticated
using (private.lmg_can_access_artist(artiste_id) and (private.lmg_role() <> 'artiste' or visible_artiste is true));
create policy artiste_documents_write_scoped on public.artiste_documents for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy equipe_artiste_read_scoped on public.equipe_artiste for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy equipe_artiste_write_scoped on public.equipe_artiste for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and private.lmg_can_access_artist(artiste_id)));

create policy prospects_read_scoped on public.prospects_lmg for select to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and responsable_id = auth.uid()));
create policy prospects_write_scoped on public.prospects_lmg for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and responsable_id = auth.uid()))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and responsable_id = auth.uid()));

create policy partenaires_admin_only on public.partenaires for all to authenticated
using (private.lmg_role() in ('super_admin','admin'))
with check (private.lmg_role() in ('super_admin','admin'));

create policy contract_approvals_read_scoped on public.contract_approvals for select to authenticated
using (private.lmg_can_access_artist(artiste_id));
create policy contract_approvals_artist_insert on public.contract_approvals for insert to authenticated
with check (artiste_id = private.lmg_artist_id() or private.lmg_role() in ('super_admin','admin'));
create policy contract_approvals_artist_update on public.contract_approvals for update to authenticated
using (artiste_id = private.lmg_artist_id() or private.lmg_role() in ('super_admin','admin'))
with check (artiste_id = private.lmg_artist_id() or private.lmg_role() in ('super_admin','admin'));

create policy release_tasks_read_scoped on public.release_tasks for select to authenticated
using (exists (select 1 from public.sorties s where s.id = release_tasks.sortie_id and private.lmg_can_access_artist(s.artiste_id)));
create policy release_tasks_write_scoped on public.release_tasks for all to authenticated
using (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and exists (select 1 from public.sorties s where s.id = release_tasks.sortie_id and private.lmg_can_access_artist(s.artiste_id))))
with check (private.lmg_role() in ('super_admin','admin','artistic_director') or (private.lmg_role() = 'manager' and exists (select 1 from public.sorties s where s.id = release_tasks.sortie_id and private.lmg_can_access_artist(s.artiste_id))));

create policy media_relances_scoped on public.media_relances for all to authenticated
using (exists (select 1 from public.medias m where m.id = media_relances.media_id))
with check (exists (select 1 from public.medias m where m.id = media_relances.media_id));

create policy commentaires_projets_read_scoped on public.commentaires_projets for select to authenticated
using (private.lmg_project_is_accessible(projet_id) or private.lmg_role() in ('super_admin','admin','artistic_director'));
create policy commentaires_projets_write_scoped on public.commentaires_projets for all to authenticated
using (private.lmg_project_is_accessible(projet_id) or private.lmg_role() in ('super_admin','admin','artistic_director'))
with check (private.lmg_project_is_accessible(projet_id) or private.lmg_role() in ('super_admin','admin','artistic_director'));

commit;
