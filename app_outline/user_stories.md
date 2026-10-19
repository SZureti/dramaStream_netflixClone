# Task Manager: user stories

This is the database for a task manager (projects, tasks, tags), designed for the Code Platoon *Databases and Supabase* homework. It isn't part of the published DramaStream site. For now, the DramaStream build tasks themselves are tracked in `Plan/Tasks.md`.

These stories come from `app_outline/` (the journey and each page's `user_story.md`), pulled into one list with one line per thing the app has to *remember*. Story 1 isn't on any page. It's there so the database knows who owns what.

Accounts come from Supabase Auth (authentication lecture): each user sees only their own projects, tasks and tags. There's no task-manager screen yet.

1. As a user, I want an account with my name and email so that the app knows which projects and tasks are mine.
2. As a user, I want to create projects with a name and a description so that I can group the work for each Netflix feature, like Profiles or Continue Watching.
3. As a user, I want to create tasks with a title so that I can track each step I still need to build.
4. As a user, I want to assign a task to a project (or leave it on its own) so that I can keep related work together.
5. As a user, I want to give a task a due date so that I know what's coming up and what's overdue.
6. As a user, I want to mark tasks as complete so that I can see how far each feature has come.
7. As a user, I want to label tasks with tags like "frontend" or "phase-1" (a task can have several) so that I can filter my list.
8. As a user, I want to see when each task was created so that I can spot old ones.
