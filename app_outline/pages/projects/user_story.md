# Projects page: `/tasks/projects`

**As a** user, **I want to** see my projects and create new ones, **so that** I can group the work for each Netflix feature together.

## On this page
- Title "Projects" and a count of projects.
- Sub-nav: **Tasks** · **Projects** (current) · **+ New task**.
- **New project** form: Name (required, up to 255 characters), Description (optional), [Create project].
- One card per project: name, description, and progress "2 of 5 done" with a small progress bar. Selecting a card → `/tasks/projects/:id`.

## Rules & errors
- Empty name → inline red message "Give your project a name"; nothing else is cleared.
- Create → the new card appears with "0 of 0 done", the form clears, and a "Project created" toast shows.

## States
- **Empty:** no projects → "No projects yet. Create one to group your tasks."

## Done when
- [ ] Creating "Downloads" with a description shows a new card
- [ ] Progress counts match the tasks in each project
- [ ] Selecting a card opens that project's page
