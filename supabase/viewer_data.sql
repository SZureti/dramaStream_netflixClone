-- SUPERSEDED by profiles.sql: these per-account tables were renamed *_old.
-- Per-viewer data (applied as migration create_my_list_and_viewing_progress).
-- Each row belongs to one signed-in user (auth.users); RLS lets a user see and
-- change only their own rows. Signed-out visitors keep this in their browser.

create table public.my_list (
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title_id  text not null references public.titles (id) on delete cascade,
  added_at  timestamptz not null default now(),
  primary key (user_id, title_id)          -- a title is on a list once
);
create index my_list_title_id_idx on public.my_list (title_id);

create table public.viewing_progress (
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title_id          text not null references public.titles (id) on delete cascade,
  season_number     smallint,                -- series only
  episode_number    smallint,                -- series only
  position_seconds  integer not null default 0 check (position_seconds >= 0),
  duration_seconds  integer not null check (duration_seconds > 0),
  hidden            boolean not null default false,   -- "Remove from row"
  updated_at        timestamptz not null default now(),
  primary key (user_id, title_id),
  check (position_seconds <= duration_seconds)
);
create index viewing_progress_title_id_idx on public.viewing_progress (title_id);
create index viewing_progress_user_recent_idx on public.viewing_progress (user_id, updated_at desc);

alter table public.my_list          enable row level security;
alter table public.viewing_progress enable row level security;

-- (select auth.uid()) runs once per query instead of once per row.
create policy my_list_select_own on public.my_list for select to authenticated
  using ((select auth.uid()) = user_id);
create policy my_list_insert_own on public.my_list for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy my_list_delete_own on public.my_list for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy progress_select_own on public.viewing_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy progress_insert_own on public.viewing_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy progress_update_own on public.viewing_progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy progress_delete_own on public.viewing_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.my_list, public.viewing_progress from anon;
grant select, insert, delete on public.my_list to authenticated;
grant select, insert, update, delete on public.viewing_progress to authenticated;
