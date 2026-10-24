create extension if not exists pgcrypto;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug_en text not null unique,
  slug_es text not null unique,
  title_en text not null,
  title_es text not null,
  content_en text not null,
  content_es text not null,
  excerpt_en text,
  excerpt_es text,
  category text not null check (category in ('fba','3pl','amazon-freight','tiktok-shop','seller-problems','news')),
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index blog_posts_published_idx on public.blog_posts (published, published_at desc);
create index blog_posts_category_idx on public.blog_posts (category);

alter table public.blog_posts enable row level security;

create policy "Public can read published posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published = true);
