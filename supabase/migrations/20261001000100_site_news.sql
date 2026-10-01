create table if not exists public.site_news (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,

  title_fr text not null,
  title_en text,

  excerpt_fr text,
  excerpt_en text,

  content_fr text,
  content_en text,

  category_fr text,
  category_en text,

  image_url text,

  status text not null default 'draft'
    check (status in ('draft', 'published')),

  featured boolean not null default false,

  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_news_status_published_at_idx
  on public.site_news(status, published_at desc);

alter table public.site_news enable row level security;

drop policy if exists "Public can read published site news"
  on public.site_news;

create policy "Public can read published site news"
  on public.site_news
  for select
  using (status = 'published');

create or replace function public.update_site_news_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_site_news_updated_at
  on public.site_news;

create trigger update_site_news_updated_at
before update on public.site_news
for each row
execute function public.update_site_news_updated_at();
