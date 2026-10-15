### Lesson’s planning work for my version:

1. Answer the eight questions: problem, user, goals, information, actions, screens, data, and permissions.
2. Choose the content and smallest set of features for my version.
3. Map the user journey and write user stories with testable criteria.
4. Sketch the screens and important states in Procreate, such as browse, search, title details, and an empty or no-results state based on the scope.
5. Write a brief style guide so the design feels consistent.
6. Review the plan and confirm the build scope before coding.

### Answer the eight questions: 

| Planning question                           | Netflix Clone                                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What problem does it solve?**             | It gives viewers an easy way to browse a curated collection of movies and series, discover something to watch, and keep track of titles they like.                                                                                                                                              |
| **Who uses it?**                            | Viewers who enjoy the genres, themes, or types of content featured in this version of the app.                                                                                                                                                                                                  |
| **What are their main goals?**              | Browse and search the catalog, learn more about a title, save titles to a personal list, and start watching or previewing a title.                                                                                                                                                              |
| **What information do they need?**          | A title’s name, artwork, description, genre, release year, maturity rating, and runtime or episode information. Depending on the content, they may also want to see the cast, director, or creator.                                                                                             |
| **What actions can they perform?**          | Browse categories, search or filter titles, open a title’s details, add or remove a title from My List, and open its playback screen. If playback is included, they can use the controls that actually work in the prototype, such as play, pause, and seek.                                    |
| **What screens are required?**              | Home/Browse, Search or Results, Title Details, Playback, and My List. Genres can be sections or filters on Browse instead of separate screens. Profile and Settings can be added if the assignment requires them.                                                                               |
| **What data must be collected or stored?**  | The prototype can use sample catalog data supplied with the app. It may need to track saved title IDs and, if playback is included, viewing progress. It does not need a real email address or password unless sign-in is explicitly part of the requirements.                                  |
| **What permissions or access rules exist?** | For a front-end prototype without accounts, no sign-in or special permissions are needed. Decide whether My List and viewing progress last only while the app is open or are saved in that browser. If you later add accounts, each user’s profile and saved titles should belong to that user. |

### Choose the content and smallest set of features for my version.

#### Content

Use a small sample catalog of **12 fictional titles**. Design the screens without relying on copyrighted movie artwork or real streaming services:

- 4 drama films
- 4 drama series
- 4 drama documentaries

Give each title a name, poster image, short description, genre, release year, content rating, and runtime or episode count. Invent the titles and use my own artwork or placeholder images.

#### Smallest useful first version

Build features:

1. **Home/Browse:** Show a featured title and a 3 rows of 4 titles for a total of 12 films, such as _Featured_, _Drama Series_, and _Drama Films_.
2. **Core features:** Browse the three categories, search titles, open a title’s details, add or remove titles from **My List**, and open a mock playback screen.
3. **Title details:** Selecting a title opens its name, poster, description, genre, year, rating, and runtime or episode count. Cast or director details are optional.
4. **My List:** Let the viewer add and remove titles from a saved list.
5. **Search:** Find titles by name. Show a clear message when there are no matches.
6. **Playback screen:** Open a designed player screen for a selected title. For this first version, make playback a **visual mockup** (Use my own visuals or an image as a placeholder) with working play/pause and a progress bar, rather than sourcing or streaming real films.



### Map the user journey and write user stories with testable criteria.

### User journeys
#### 1. Browse and explore a title

The viewer opens **Home** and sees a featured drama title plus rows for **Drama Films**, **Drama Series**, and **Drama Documentaries**. They browse a row, select a title, and land on its **Title Details** screen. They can review its poster, description, release year, content rating, and runtime or episode count, then return to Home.

#### 2. Search for and save a title

The viewer opens **Search**, enters a title or part of a title, and sees matching results. They select a result to view its details, then choose **Add to My List**. The control changes to **Remove from My List**. They open **My List** and see the saved title. If their search has no matches, the app explains that and offers a way to clear the search.

#### 3. Open and use the mock player

The viewer opens a title’s details and selects **Play**. The app opens the **Playback** screen for that title and displays its artwork or other placeholder visual. The viewer uses **Play/Pause** and the progress control. They can return to the title details or Home without losing the title they were viewing.

## User stories and testable workflow

### Story 1: Browse the catalog

**As a viewer, I want to browse drama films, series, and documentaries so I can find something I want to watch.**

Workflow:

- Home displays one featured title and three category rows.
- Each category contains four titles; the featured title is also counted in its category.
- Selecting a title opens details for that same title.
- Returning from details takes the viewer back to Home.

### Story 2: View title details

**As a viewer, I want to see information about a title so I can decide whether to watch it.**

Workflow:

- The details screen shows the title’s name, poster, description, release year, content rating, and runtime or episode count.
- The details match the title selected from Home, Search, or My List.
- A visible control lets the viewer return to the previous screen.

### Story 3: Search the catalog

**As a viewer, I want to search by title so I can find a specific film, series, or documentary.**

Workflow:

- Entering a title or part of a title displays matching catalog results.
- Selecting a result opens details for the correct title.
- A search with no matches displays a clear “No titles found” message.
- The viewer can clear the search and try again.

### Story 4: Save a title to My List

**As a viewer, I want to save a title to My List so I can find it again later.**

Workflow:

- Selecting **Add to My List** adds that title once.
- The control changes to **Remove from My List** after adding.
- My List displays each saved title.
- Removing a title removes it from My List and changes the control back to **Add to My List**.
- If My List is empty, the app shows an empty-state message.

### Story 5: Use the mock player

**As a viewer, I want to open a title in a mock player so I can see how playback would work in the app.**

Workflow:

- Selecting **Play** from title details opens the playback screen for that title.
- The playback screen identifies the selected title and shows placeholder visuals.
- Selecting **Play/Pause** toggles between the two states and updates the control’s label or icon.
- Moving the progress control updates the displayed progress.
- A visible control lets the viewer leave playback and return to the title details.



---

# Task tracking for the DramaStream build

The work left to make DramaStream feel like the real Netflix site is tracked in **[`Plan/Tasks.md`](./Tasks.md)**: a checklist of 64 tasks in 14 feature areas, tagged by kind of work and by phase. It's a plain markdown file in the repo, **not part of the published site**, so visitors never see it.

Separately, the Code Platoon *Databases and Supabase* homework (https://kabeier.github.io/Databases-and-Supabase/) has a task-manager database: projects, tasks and tags, as in the class demo app Ticked. Its files are laid out the way the class lays them out:

```text
dramaStream_netflixClone/
  app_outline/            the task manager's spec, as for Ticked
    user_journey.md       the journey and data rules
    style_guide.md
    pages/                tasks/, new_task/, projects/, project_detail/: one user_story.md each
    user_stories.md       what the database must remember (8 stories)
    task-manager-erd.png  the DrawSQL diagram
  supabase/               the database work, as in the class's ticked/supabase/
    .claude/              postgresql-table-design skill + supabase-agent
    .mcp.json             the Supabase MCP (project scope); start Claude here for database work
    schema.sql            the schema that was built
    task-manager-erd.png, user_stories.md
```

The tables live in Supabase only. No task-manager screen is built into DramaStream, and nothing in `src/` talks to these tables.

### Decisions

These follow the curriculum and its Ticked demo.

| Question | Decision | Why |
| --- | --- | --- |
| Where do the build tasks live? | **`Plan/Tasks.md`**, outside the site. | The tracker is for me, not for DramaStream's visitors. A checklist file needs no code, no hosting and no login. |
| Should tasks get description or priority columns? | **No.** Keep the diagram's columns. Priority comes from the `phase-1/2/3` tags. | Same columns as the class schema; don't add design that no story needs. |
| Must every task belong to a project? | **No.** `project_id` is optional, and **deleting a project keeps its tasks** (`ON DELETE SET NULL`). | Ticked's story: "Its tasks stay, but lose their project". In Supabase this still needs the SQL under **Pending** below. |
| Are tags shared or per user? | **Shared.** Names are unique regardless of capitals ("Frontend" = "frontend"), enforced by a unique index on `lower(name)`. | Same as Ticked. The authentication lecture revisits ownership. |
| `due_date` type? | **`date`**. | A calendar day, so overdue and sorting work. Done in migration `tasks_due_date_to_date`. |
| Temporary open RLS policies? | **Remove them** (RLS on, no rules) until the API lecture adds dev rules. Still to run: see **Pending** below. | Nothing calls the API, so open policies only exposed the data. |
| Users and login? | `users` stays a plain table, and `user_id` is optional (`ON DELETE SET NULL`). The authentication lecture rebuilds `users` around `auth.users`. | Matches the class schema and what the next lectures expect. |

### Pending: migration `align_with_class_schema`

`supabase/schema.sql` already shows the target.

**Already applied** (migration `align_with_class_schema_part1`):

- `users.name` and `users.email` are NOT NULL.
- A unique index on `lower(tags.name)`.

**Still to run.** The Supabase MCP declines statements that drop or delete, so run this in the Supabase **SQL Editor**:

```sql
-- Deleting a project keeps its tasks; they just lose their project.
alter table public.tasks drop constraint tasks_project_id_fkey;
alter table public.tasks add constraint tasks_project_id_fkey
  foreign key (project_id) references public.projects (id) on delete set null;

-- RLS stays on with no rules until the API lecture.
drop policy dev_anon_all_users     on public.users;
drop policy dev_anon_all_projects  on public.projects;
drop policy dev_anon_all_tasks     on public.tasks;
drop policy dev_anon_all_tags      on public.tags;
drop policy dev_anon_all_task_tags on public.task_tags;

-- Remove the test rows from the schema check.
delete from public.task_tags;
delete from public.tasks where title = 'TEST Task';
delete from public.projects where name = 'TEST Project';
delete from public.tags where name in ('test_tag_a', 'test_tag_b');
delete from public.users where email = 'test_schema_check@example.com';
```
