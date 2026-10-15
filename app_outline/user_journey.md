# User Journey: DramaStream Tasks (Task Manager)

> **Status:** this is a spec, not a built screen. The task manager's database exists in Supabase (`supabase/schema.sql`), but no task screens ship in DramaStream: the published site stays for viewers only. The DramaStream build tasks are tracked in `Plan/Tasks.md`. The routes below (`/tasks`, …) describe how the app would work if it's built later, for example as a private app in the API lecture.

**What it is:** A task manager for planning and tracking the work that makes DramaStream feel like the real Netflix site. The work is grouped into projects (one per feature area), split into tasks, given due dates, labelled with tags, and ticked off.

**Problem:** The Netflix-parity backlog is around 75 tasks across 14 feature areas. In a notes file it's impossible to see what's done, what's next and what's late.

**User:** One type, the DramaStream builder. There are no accounts yet, so everyone who opens the app sees the same lists.

## The journey

1. **Opens the task manager** → lands on **Tasks** (`/tasks`). They see every task, open ones first, each with its project, due date and tags.
   - First visit: the DramaStream backlog is already loaded (see Data rules).
   - No tasks at all: "Nothing to do yet. Add your first task." with an **Add task** button.
2. **Selects "+ New task"** → goes to **New Task** (`/tasks/new`).
3. **Types a title** (for example "Build the Who's Watching screen"), **picks a project** (or "No project"), **picks a due date** (optional), and **taps tags** like `frontend` or `phase-2` (or types a new tag).
   - **Mistake:** they select Save with an empty title → an inline red message appears under the title: "Give your task a title". Nothing else on the form is cleared.
4. **Selects "Save task"** → goes back to **Tasks** with a "Task added" toast. The new task is in the open tasks, in due-date order.
5. **On Tasks**, they tick the checkbox next to a task → it is marked complete, gets a line through it and moves to the Done group. Ticking again re-opens it.
   - They can filter by **status** (All · Open · Done), by **tag** and by **project**, and search by title.
   - If a filter shows nothing: "No tasks match this filter" + **Clear filters**.
   - They can delete a task with the trash icon. It asks "Delete this task?" first.
6. **Selects "Projects"** in the Tasks sub-nav → **Projects** (`/tasks/projects`). They see each project with its description and progress ("2 of 5 done"), and can create a project with a name and description.
   - **Mistake:** Create with an empty name → inline message "Give your project a name".
7. **Selects a project** → **Project Detail** (`/tasks/projects/:id`) shows its description and only its tasks. They can tick tasks here too, and "+ Add task to this project" opens New Task with that project already picked.
   - **Delete project** first asks "Delete this project? Its tasks stay, but lose their project."
8. **Unknown project id** → "That project doesn't exist", with a link back to Projects. Any other unknown URL → DramaStream's 404 page.

## Data rules

- **All reading and changing of data happens in ONE file (a data layer such as `db.js`).** It holds four arrays shaped like the Supabase tables: `projects`, `tasks`, `tags`, `task_tags`. Every function is `async`, so swapping in real Supabase calls later only touches that file.
- **The tables exist in Supabase** (see `supabase/schema.sql`). Connecting an app to them comes in the API lecture.
- **Same shape as the database:**
  - Every row has an `id` (UUID); projects and tasks have `created_at`.
  - `due_date` is `YYYY-MM-DD` or null; `project_id` is null when there's no project.
  - Deleting a project keeps its tasks (`project_id` becomes null), and deleting a task removes its `task_tags` rows.
  - Tag names are unique regardless of capitals.
- **Seed data** would be the checklist in `Plan/Tasks.md`: 14 projects with their tasks and tags.
