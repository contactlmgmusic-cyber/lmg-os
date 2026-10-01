-- LMG Music News
-- Database privileges required before RLS policies are evaluated

grant usage on schema public
to anon, authenticated;

grant select on table public.site_news
to anon;

grant select, insert, update, delete
on table public.site_news
to authenticated;
