-- LMG Music News
-- Admin / Super Admin editorial permissions

drop policy if exists "site_news_admin_select"
  on public.site_news;

drop policy if exists "site_news_admin_insert"
  on public.site_news;

drop policy if exists "site_news_admin_update"
  on public.site_news;

drop policy if exists "site_news_admin_delete"
  on public.site_news;


create policy "site_news_admin_select"
  on public.site_news
  for select
  to authenticated
  using (
    private.lmg_role() in ('super_admin', 'admin')
  );


create policy "site_news_admin_insert"
  on public.site_news
  for insert
  to authenticated
  with check (
    private.lmg_role() in ('super_admin', 'admin')
  );


create policy "site_news_admin_update"
  on public.site_news
  for update
  to authenticated
  using (
    private.lmg_role() in ('super_admin', 'admin')
  )
  with check (
    private.lmg_role() in ('super_admin', 'admin')
  );


create policy "site_news_admin_delete"
  on public.site_news
  for delete
  to authenticated
  using (
    private.lmg_role() in ('super_admin', 'admin')
  );
