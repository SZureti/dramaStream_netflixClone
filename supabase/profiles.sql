-- Profiles, profile-scoped My List / progress, ratings and reviews
-- (applied as migrations create_profiles_and_ratings + owns_profile_security_invoker).
-- Replaces the per-account my_list / viewing_progress from viewer_data.sql;
-- those empty tables were renamed my_list_old / viewing_progress_old and can be dropped:
--   drop table public.my_list_old, public.viewing_progress_old;

create table public.profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name               text not null check (length(btrim(name)) between 1 and 30),
  avatar             text not null default 'red' check (avatar in ('red', 'blue', 'green', 'yellow', 'purple', 'teal')),
  is_kids            boolean not null default false,
  max_maturity       text not null default 'all' check (max_maturity in ('little-kids', 'older-kids', 'teens', 'all')),
  language           text not null default 'en',
  autoplay_next      boolean not null default true,
  autoplay_previews  boolean not null default true,
  created_at         timestamptz not null default now(),
  unique (user_id, name),
  check (not is_kids or max_maturity in ('little-kids', 'older-kids'))
);
create index profiles_user_id_idx on public.profiles (user_id);

-- At most five profiles per account.
create function public.enforce_profile_limit() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.profiles where user_id = new.user_id) >= 5 then
    raise exception 'An account can have at most 5 profiles' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke execute on function public.enforce_profile_limit() from public, anon, authenticated;
create trigger profiles_limit before insert on public.profiles
  for each row execute function public.enforce_profile_limit();

alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_delete_own on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

-- Does this profile belong to the signed-in user? (Runs as the caller; profiles RLS applies.)
create function public.owns_profile(p_profile_id uuid) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = p_profile_id and p.user_id = (select auth.uid()));
$$;
revoke execute on function public.owns_profile(uuid) from public, anon;
grant execute on function public.owns_profile(uuid) to authenticated;

create table public.my_list (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title_id    text not null references public.titles (id) on delete cascade,
  added_at    timestamptz not null default now(),
  constraint my_list_profile_pkey primary key (profile_id, title_id)
);
create index my_list_profile_title_id_idx on public.my_list (title_id);

create table public.viewing_progress (
  profile_id        uuid not null references public.profiles (id) on delete cascade,
  title_id          text not null references public.titles (id) on delete cascade,
  season_number     smallint,
  episode_number    smallint,
  position_seconds  integer not null default 0 check (position_seconds >= 0),
  duration_seconds  integer not null check (duration_seconds > 0),
  hidden            boolean not null default false,
  updated_at        timestamptz not null default now(),
  constraint viewing_progress_profile_pkey primary key (profile_id, title_id),
  check (position_seconds <= duration_seconds)
);
create index viewing_progress_profile_title_id_idx on public.viewing_progress (title_id);
create index viewing_progress_profile_recent_idx on public.viewing_progress (profile_id, updated_at desc);

-- Netflix's three ratings.
create table public.ratings (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title_id    text not null references public.titles (id) on delete cascade,
  value       text not null check (value in ('not-for-me', 'like', 'love')),
  updated_at  timestamptz not null default now(),
  primary key (profile_id, title_id)
);
create index ratings_title_id_idx on public.ratings (title_id);

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title_id    text not null references public.titles (id) on delete cascade,
  rating      text not null check (rating in ('not-for-me', 'like', 'love')),
  body        text not null check (length(btrim(body)) between 10 and 600),
  created_at  timestamptz not null default now()
);
create index reviews_profile_title_idx on public.reviews (profile_id, title_id, created_at desc);
create index reviews_title_id_idx on public.reviews (title_id);

alter table public.my_list          enable row level security;
alter table public.viewing_progress enable row level security;
alter table public.ratings          enable row level security;
alter table public.reviews          enable row level security;

create policy my_list_own on public.my_list for all to authenticated
  using ((select public.owns_profile(profile_id))) with check ((select public.owns_profile(profile_id)));
create policy progress_own on public.viewing_progress for all to authenticated
  using ((select public.owns_profile(profile_id))) with check ((select public.owns_profile(profile_id)));
create policy ratings_own on public.ratings for all to authenticated
  using ((select public.owns_profile(profile_id))) with check ((select public.owns_profile(profile_id)));
create policy reviews_own on public.reviews for all to authenticated
  using ((select public.owns_profile(profile_id))) with check ((select public.owns_profile(profile_id)));

revoke all on public.profiles, public.my_list, public.viewing_progress, public.ratings, public.reviews from anon;
grant select, insert, update, delete on public.profiles, public.my_list, public.viewing_progress,
  public.ratings, public.reviews to authenticated;
