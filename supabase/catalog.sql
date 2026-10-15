-- DramaStream catalog schema (applied as migration create_catalog).
-- What the site shows: readable by everyone, written only through migrations,
-- the seed (supabase/seed/catalog.sql) or the dashboard. There are no
-- insert/update/delete policies, so the publishable key can only read.

create table public.titles (
  id               text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),  -- URL slug, e.g. 'breaking-bad'
  title            text not null check (length(title) between 1 and 200),
  type             text not null check (type in ('film', 'series', 'documentary')),
  synopsis         text not null,
  release_year     smallint not null check (release_year between 1880 and 2100),
  content_rating   text not null,
  runtime_minutes  smallint check (runtime_minutes > 0),   -- films and documentaries
  seasons          smallint check (seasons > 0),           -- series
  episode_count    smallint check (episode_count > 0),     -- series
  limited_series   boolean not null default false,
  cast_label       text,                                   -- e.g. 'Featuring' for documentaries
  hero_position    text,                                   -- CSS object-position for the hero image
  is_featured      boolean not null default false,
  sort_order       smallint not null default 0,            -- order within its row
  created_at       timestamptz not null default now(),
  check (type = 'series' or runtime_minutes is not null),
  check (type <> 'series' or (seasons is not null and episode_count is not null))
);
create index titles_type_sort_idx on public.titles (type, sort_order);
create unique index titles_one_featured_idx on public.titles (is_featured) where is_featured;  -- at most one

create table public.genres (
  id    bigint generated always as identity primary key,
  name  text not null unique
);

create table public.title_genres (
  title_id  text not null references public.titles (id) on delete cascade,
  genre_id  bigint not null references public.genres (id) on delete cascade,
  position  smallint not null default 0,
  primary key (title_id, genre_id)
);
create index title_genres_genre_id_idx on public.title_genres (genre_id);

create table public.people (
  id    bigint generated always as identity primary key,
  name  text not null unique
);

-- Crew credits ('Director', 'Created by', …) and cast (role = 'Cast').
create table public.credits (
  title_id       text not null references public.titles (id) on delete cascade,
  person_id      bigint not null references public.people (id) on delete cascade,
  role           text not null,
  role_position  smallint not null default 0,   -- order of the role on the page
  position       smallint not null default 0,   -- order of the name within the role
  primary key (title_id, role, person_id)
);
create index credits_person_id_idx on public.credits (person_id);

create table public.seasons (
  title_id       text not null references public.titles (id) on delete cascade,
  season_number  smallint not null check (season_number > 0),
  primary key (title_id, season_number)
);

create table public.episodes (
  id               bigint generated always as identity primary key,
  title_id         text not null,
  season_number    smallint not null,
  episode_number   smallint not null check (episode_number > 0),
  name             text not null,
  runtime_minutes  smallint not null check (runtime_minutes > 0),
  foreign key (title_id, season_number) references public.seasons (title_id, season_number) on delete cascade,
  unique (title_id, season_number, episode_number)
);

alter table public.titles       enable row level security;
alter table public.genres       enable row level security;
alter table public.title_genres enable row level security;
alter table public.people       enable row level security;
alter table public.credits      enable row level security;
alter table public.seasons      enable row level security;
alter table public.episodes     enable row level security;

create policy catalog_read_titles       on public.titles       for select to anon, authenticated using (true);
create policy catalog_read_genres       on public.genres       for select to anon, authenticated using (true);
create policy catalog_read_title_genres on public.title_genres for select to anon, authenticated using (true);
create policy catalog_read_people       on public.people       for select to anon, authenticated using (true);
create policy catalog_read_credits      on public.credits      for select to anon, authenticated using (true);
create policy catalog_read_seasons      on public.seasons      for select to anon, authenticated using (true);
create policy catalog_read_episodes     on public.episodes     for select to anon, authenticated using (true);

grant select on public.titles, public.genres, public.title_genres, public.people,
  public.credits, public.seasons, public.episodes to anon, authenticated;

-- Added later (migration episodes_synopsis_and_still): optional episode details.
alter table public.episodes
  add column synopsis text check (synopsis is null or length(synopsis) <= 400),
  add column still_path text;  -- site path to the episode still, e.g. /assets/stills/breaking-bad-s1e1.jpg
