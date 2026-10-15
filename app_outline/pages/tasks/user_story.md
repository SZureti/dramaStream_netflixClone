# Tasks page: `/tasks`

**As a** user, **I want to** see all my tasks with their project, due date and tags, and tick them off, **so that** I always know what's left to build.

## On this page
- Title "Tasks" and a count: "68 open · 7 done".
- Sub-nav: **Tasks** (current) · **Projects** · **+ New task**.
- Filters:
  - **Search** by title (any capitals, part of a word)
  - **Status**: All · Open · Done
  - **Tag** dropdown: All tags · frontend · phase-1 · …
  - **Project** dropdown: All projects · No project · each project
- Filters are kept in the URL (`?status=open&tag=…`), so a filtered view can be bookmarked and Back works.
- Task rows: open tasks first (soonest due date first, no due date last), then done tasks. Each row has:
  - a **checkbox** that ticks the task complete or re-opens it;
  - the **title**;
  - a small line: project name (a link) · due date ("Due tomorrow", "Due Oct 20", or a red "Overdue" if it's past) · tag chips;
  - a small grey "Added 3 days ago" (from `created_at`);
  - a **trash icon** → "Delete this task?" [Cancel] [Delete].

## States
- **Empty:** no tasks at all → "Nothing to do yet. Add your first task." + [Add task].
- **Filtered empty:** → "No tasks match this filter" + [Clear filters].

## Done when
- [ ] Ticking a checkbox moves the task to Done (and back) without a page reload
- [ ] Filtering by `phase-1` shows only phase-1 tasks; adding Status = Open narrows it further
- [ ] Searching "player" shows only tasks with "player" in the title
- [ ] Deleting asks first, then removes the task
- [ ] Refreshing the page keeps ticks and new tasks (saved in this browser)
