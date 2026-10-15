-- schema.sql: Task Manager database (users, projects, tasks, tags, task_tags)
-- From task-manager-erd.png (DrawSQL) and user_stories.md, both in this folder.
-- Supabase project: qugsfvplmeajymvyjqqn
--
-- Changes from the diagram, each approved:
--   - users.created_ai -> created_at (typo in the diagram).
--   - task_tags primary key is (task_id, tag_id), so a task can have several tags.
--   - tasks.due_date is date (the diagram said text).
--   - ids default to gen_random_uuid(); created_at is NOT NULL DEFAULT now().
--   - NOT NULL where a story needs the value; UNIQUE on users.email and tags.name.
--   - Foreign keys say what happens on delete, and every FK column has an index
--     (PostgreSQL doesn't index foreign keys for you).
--   - Row Level Security is on for every table, with no rules yet.
--
-- Order matters: a table must exist before another table can point a foreign key at it.


-- 1. users ----------------------------------------------------------------
-- Story 1: an account with a name and email, so the app knows what's whose.
create table public.users (
  id          uuid          primary key default gen_random_uuid(),
  name        varchar(100)  not null,
  email       varchar(255)  not null unique,
  created_at  timestamptz   not null default now()   -- diagram: "created_ai"
);

alter table public.users enable row level security;


-- 2. projects -------------------------------------------------------------
-- Story 2: projects with a name and a description.
create table public.projects (
  id           uuid          primary key default gen_random_uuid(),
  name         varchar(255)  not null,
  description  text,
  user_id      uuid          references public.users (id) on delete set null,
  created_at   timestamptz   not null default now()
);

create index projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;


-- 3. tags -----------------------------------------------------------------
-- Story 7: labels like "school" or "urgent".
create table public.tags (
  id    uuid         primary key default gen_random_uuid(),
  name  varchar(50)  not null unique
);

-- "Urgent" and "urgent" are the same tag.
create unique index tags_name_lower_key on public.tags (lower(name));

alter table public.tags enable row level security;


-- 4. tasks ----------------------------------------------------------------
-- Stories 3, 4, 5, 6, 8: title, optional project, optional due date,
-- complete flag, created time.
-- on delete set null: deleting a project keeps its tasks, they just lose the project.
create table public.tasks (
  id           uuid          primary key default gen_random_uuid(),
  title        varchar(255)  not null,
  is_complete  boolean       not null default false,
  due_date     date,
  project_id   uuid          references public.projects (id) on delete set null,
  user_id      uuid          references public.users (id) on delete set null,
  created_at   timestamptz   not null default now()
);

create index tasks_user_id_idx    on public.tasks (user_id);
create index tasks_project_id_idx on public.tasks (project_id);

alter table public.tasks enable row level security;


-- 5. task_tags ------------------------------------------------------------
-- Story 7: many-to-many join, a task can have several tags.
-- on delete cascade: deleting a task (or tag) removes its pairings, not the other side.
create table public.task_tags (
  task_id  uuid  not null references public.tasks (id) on delete cascade,
  tag_id   uuid  not null references public.tags (id)  on delete cascade,
  primary key (task_id, tag_id)
);

-- task_id is covered by the primary key; tag_id needs its own index.
create index task_tags_tag_id_idx on public.task_tags (tag_id);

alter table public.task_tags enable row level security;


-- =========================================================================
-- LATER, NOT APPLIED
-- =========================================================================
--
-- API lecture: when the app starts calling the database with the publishable
-- key, RLS with no rules returns [] for reads and refuses writes. The
-- supabase-agent proposes temporary dev rules then, for example:
--
--   create policy dev_anon_all_tasks on public.tasks
--     for all to anon, authenticated using (true) with check (true);
--
-- Authentication lecture: users becomes a mirror of auth.users, the dev rules
-- are dropped, and each table gets rules on user_id, for example:
--
--   create policy tasks_own on public.tasks
--     for all to authenticated
--     using ((select auth.uid()) = user_id)
--     with check ((select auth.uid()) = user_id);
