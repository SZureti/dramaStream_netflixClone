-- schema.sql: Task Manager database (users, projects, tasks, tags, task_tags)
-- From task-manager-erd.png (DrawSQL) and user_stories.md, both in this folder.
-- Supabase project: qugsfvplmeajymvyjqqn
--
-- Authentication lecture (2026-10-19): the tables were backed up to
-- supabase/backups/, dropped and recreated with Supabase Auth. Applied in the
-- SQL Editor in four steps, in this order. Tables started empty (the backups
-- were test data and were not re-imported).
--
-- Changes from the diagram, each approved:
--   - users.created_ai -> created_at (typo in the diagram).
--   - users.id IS the auth.users id: a trigger adds a users row for every new
--     account, and accounts that already existed were backfilled.
--   - Every other table has user_id: not null, default auth.uid(), on delete
--     cascade. The app never sends a user id; deleting an account in
--     Authentication deletes all of its rows.
--   - Tags belong to a user (each person has their own "urgent"), unique per
--     user regardless of capitals.
--   - Same-owner foreign keys: a task can only point at its owner's project,
--     and task_tags only links a user's own task to that user's own tag.
--   - task_tags primary key is (task_id, tag_id), so a task can have several tags.
--   - tasks.due_date is date (the diagram said text).
--   - ids default to gen_random_uuid(); created_at is NOT NULL DEFAULT now().
--   - Every FK column has an index (PostgreSQL doesn't index foreign keys for you).
--   - Row Level Security on every table: signed-in users see and change only
--     their own rows; signed-out visitors (anon) get nothing.
--
-- This project also holds DramaStream (catalog.sql, profiles.sql, ...). The
-- trigger runs for DramaStream sign-ups too, which is harmless: they share
-- auth.users.
--
-- Order matters: a table must exist before another table can point a foreign key at it.


-- 1. users + sign-up trigger ----------------------------------------------
-- Story 1: an account with a name and email, so the app knows what's whose.
create table public.users (
  id          uuid          primary key references auth.users (id) on delete cascade,
  name        varchar(100)  not null,
  email       varchar(255)  not null unique,
  created_at  timestamptz   not null default now()   -- diagram: "created_ai"
);
alter table public.users enable row level security;

-- New account -> users row. security definer so it can write to public.users
-- during sign-up; empty search_path so it can't be tricked into using another
-- schema's objects. Name comes from sign-up metadata, else the email's local part.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)), 100),
    new.email
  );
  return new;
end;
$$;

-- Only the trigger should run it, not the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-time backfill for accounts that existed before the trigger.
insert into public.users (id, name, email, created_at)
select id,
       left(coalesce(nullif(raw_user_meta_data ->> 'name', ''), split_part(email, '@', 1)), 100),
       email,
       created_at
from auth.users
where email is not null
on conflict (id) do nothing;


-- 2. projects -------------------------------------------------------------
-- Story 2: projects with a name and a description.
create table public.projects (
  id           uuid          primary key default gen_random_uuid(),
  name         varchar(255)  not null,
  description  text,
  user_id      uuid          not null default auth.uid() references public.users (id) on delete cascade,
  created_at   timestamptz   not null default now(),
  unique (id, user_id)       -- lets tasks require "same owner" (below)
);
create index projects_user_id_idx on public.projects (user_id);
alter table public.projects enable row level security;


-- 3. tags -----------------------------------------------------------------
-- Story 7: labels like "school" or "urgent", per user.
create table public.tags (
  id       uuid         primary key default gen_random_uuid(),
  name     varchar(50)  not null,
  user_id  uuid         not null default auth.uid() references public.users (id) on delete cascade,
  unique (id, user_id)
);
-- "Urgent" and "urgent" are the same tag (for one user).
create unique index tags_user_name_key on public.tags (user_id, lower(name));
alter table public.tags enable row level security;


-- 4. tasks ----------------------------------------------------------------
-- Stories 3, 4, 5, 6, 8: title, optional project, optional due date,
-- complete flag, created time.
-- (project_id, user_id) must match one of THIS user's projects.
-- on delete set null (project_id): deleting a project keeps its tasks, they
-- just lose the project (PostgreSQL 15+).
create table public.tasks (
  id           uuid          primary key default gen_random_uuid(),
  title        varchar(255)  not null,
  is_complete  boolean       not null default false,
  due_date     date,
  project_id   uuid,
  user_id      uuid          not null default auth.uid() references public.users (id) on delete cascade,
  created_at   timestamptz   not null default now(),
  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index tasks_user_id_idx    on public.tasks (user_id);
-- Covers the (project_id, user_id) foreign key, like task_tags' indexes.
create index tasks_project_fk_idx on public.tasks (project_id, user_id);
alter table public.tasks enable row level security;


-- 5. task_tags ------------------------------------------------------------
-- Story 7: many-to-many join, a task can have several tags.
-- on delete cascade: deleting a task (or tag) removes its pairings, not the other side.
create table public.task_tags (
  task_id  uuid  not null,
  tag_id   uuid  not null,
  user_id  uuid  not null default auth.uid() references public.users (id) on delete cascade,
  primary key (task_id, tag_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  foreign key (tag_id,  user_id) references public.tags  (id, user_id) on delete cascade
);
create index task_tags_tag_id_idx  on public.task_tags (tag_id, user_id);
create index task_tags_task_fk_idx on public.task_tags (task_id, user_id);
create index task_tags_user_id_idx on public.task_tags (user_id);
alter table public.task_tags enable row level security;


-- 6. Access: own rows only ------------------------------------------------
-- (select auth.uid()) runs once per query instead of once per row.
-- The "dev: open access until auth" rules from the API lecture are gone.
revoke all on public.users, public.projects, public.tags, public.tasks, public.task_tags from anon;

grant select, update                  on public.users     to authenticated;  -- rows come from the trigger
grant select, insert, update, delete  on public.projects  to authenticated;
grant select, insert, update, delete  on public.tags      to authenticated;
grant select, insert, update, delete  on public.tasks     to authenticated;
grant select, insert, delete          on public.task_tags to authenticated;

-- users: see and rename yourself. No insert (the trigger does it) and no
-- delete (deleting the account in Authentication cascades here).
create policy users_select_own on public.users for select to authenticated
  using ((select auth.uid()) = id);
create policy users_update_own on public.users for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy projects_own on public.projects for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tags_own on public.tags for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tasks_own on public.tasks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy task_tags_own on public.task_tags for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- No front-end supabase.rpc functions exist for the task manager, so there are
-- no functions to recreate here.
