begin;
create schema if not exists private;
create or replace function private.portal_editor()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')); $$;
revoke all on function private.portal_editor() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.portal_editor() to authenticated;

create table if not exists public.portal_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('news', 'project')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  status text not null default 'draft' check (status in ('draft', 'published')),
  data jsonb not null check (jsonb_typeof(data) = 'object' and length(data->>'title') > 0 and length(data->>'intro') > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(kind, slug)
);
alter table public.portal_content enable row level security;
revoke all on public.portal_content from anon, authenticated;
grant select on public.portal_content to anon, authenticated;
grant insert, update on public.portal_content to authenticated;
create policy portal_published_read on public.portal_content for select to anon, authenticated using (status = 'published');
create policy portal_editor_read on public.portal_content for select to authenticated using ((select private.portal_editor()));
create policy portal_editor_insert on public.portal_content for insert to authenticated with check ((select private.portal_editor()));
create policy portal_editor_update on public.portal_content for update to authenticated using ((select private.portal_editor())) with check ((select private.portal_editor()));
create or replace function private.portal_content_updated()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.slug <> old.slug or new.kind <> old.kind or new.created_at <> old.created_at then
    raise exception 'Identifiant, type et adresse du contenu immuables.';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end; $$;
create trigger portal_content_updated before update on public.portal_content for each row execute function private.portal_content_updated();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portal-media', 'portal-media', true, 5242880, array['image/png','image/jpeg','image/webp']);
create policy portal_media_editor_insert on storage.objects for insert to authenticated
with check (bucket_id = 'portal-media' and (select private.portal_editor()));
create policy portal_media_editor_read on storage.objects for select to authenticated
using (bucket_id = 'portal-media' and (select private.portal_editor()));
-- Files are immutable via the editor: new uploads get a new random path.

insert into public.portal_content(kind,slug,status,data) values ('project','fly','published','{"title":"LAAM — FLY","division":"Music","category":"Projet artistique","image":"/images/laam-fly.png","alt":"Visuel du projet FLY de LAAM","intro":"Un projet musical à découvrir dans l’univers de LMG Music.","heading":"Une voix. Un univers.","body":"FLY met à l’honneur LAAM au sein du pôle musical du groupe. Cette sélection donne un premier regard sur le projet et son identité visuelle.","context":"Musique","focus":"Projet & univers artistique","href":"https://legacymusicgroup.fr","linkLabel":"Explorer LMG Music","sections":[{"title":"LAAM","text":"Un artiste à découvrir à travers FLY et l’univers du pôle LMG Music."},{"title":"FLY","text":"Le visuel du projet constitue le premier point d’entrée de cette présentation."},{"title":"LMG Music","text":"Le site du pôle musical prolonge l’exploration des artistes et de leurs projets."}]}'::jsonb) on conflict(kind,slug) do nothing;

insert into public.portal_content(kind,slug,status,data) values ('project','deepa','published','{"title":"Deepa Be Yourself","division":"Agency","category":"Expérience digitale","image":"/images/deepa.jpg","alt":"Univers de la maison de parfums Deepa Be Yourself","intro":"L’univers d’une maison de parfums, prolongé dans une expérience digitale.","heading":"Une maison. Une expérience.","body":"Pour Deepa Be Yourself, le projet digital relie la collection, les pages produit et le parcours client. L’enjeu : faire découvrir les parfums dans un univers cohérent et faciliter le passage de la découverte à l’achat.","context":"Parfumerie","focus":"Site & parcours client","href":"https://www.deepabeyourself.com","linkLabel":"Visiter Deepa Be Yourself","sections":[{"title":"Poser un univers","text":"La présentation de la maison donne un contexte à la collection et installe son identité."},{"title":"Guider la découverte","text":"Les pages produit et les pyramides olfactives donnent des repères pour explorer les parfums."},{"title":"Relier découverte et achat","text":"La navigation entre collection, fiches produit et boutique prolonge l’univers de la marque dans un parcours cohérent."}]}'::jsonb) on conflict(kind,slug) do nothing;

insert into public.portal_content(kind,slug,status,data) values ('news','un-nouveau-regard-sur-lmg','published','{"title":"Un nouveau regard sur LMG.","category":"Vie du groupe","publishedAt":"2026-09-27","dateLabel":"27 septembre 2026","intro":"Legacy Music Group présente son portail : un point d’entrée commun pour découvrir sa vision, ses métiers et ses projets.","sections":[{"title":"Une porte d’entrée sur le groupe","text":"Le portail LMG réunit la présentation du groupe, ses trois pôles et une sélection de projets. Il permet de comprendre les liens entre musique, divertissement et création, puis de rejoindre l’univers qui correspond à son besoin."},{"title":"Trois expertises à découvrir","text":"LMG Music accompagne les projets artistiques. LMG Entertainment relie les talents aux événements et au public. LMG Agency intervient sur la stratégie, la création et le digital. Le portail présente ces métiers et donne accès à leurs espaces dédiés."},{"title":"Des projets pour entrer dans nos univers","text":"FLY de LAAM et l’expérience digitale de Deepa Be Yourself font partie de la première sélection présentée sur le portail. Leurs pages ouvrent la découverte des univers Music et Agency."}]}'::jsonb) on conflict(kind,slug) do nothing;

commit;
