begin;

drop view if exists public.public_projets;

create view public.public_projets
with (security_barrier = true)
as
select
  p.id, p.artiste_id, p.titre, p.slug, p.type, p.cover_url,
  p.hero_image_url, p.date_sortie, p.description, p.credits,
  p.spotify_url, p.apple_music_url, p.youtube_url,
  p.featured, p.show_in_carousel, p.display_order, p.created_at,
  p.created_at as updated_at, p.is_public,
  jsonb_build_object(
    'id', a.id,
    'nom', a.nom,
    'slug', a.slug,
    'style', a.style,
    'photo_url', a.photo_url,
    'spotify_image_url', a.spotify_image_url
  ) as artistes
from public.projets p
left join public.artistes a on a.id = p.artiste_id and a.is_public is true
where p.is_public is true;

revoke all on public.public_projets from public;
grant select on public.public_projets to anon, authenticated;

commit;
