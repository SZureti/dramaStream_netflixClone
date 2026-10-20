# DramaStream tasks

The work left to make DramaStream feel like the real Netflix site: 78 tasks in 15 feature areas. This file is my tracker. It lives in the repo as my own notes and isn't part of the published site.

**How to use it**

- Tick a box (`- [x]`) when a task is done. GitHub and VS Code's preview show the boxes.
- Each `##` heading is a feature area (a *project*), and each line is a *task*. These are the same projects, tasks and tags that the task-manager tables in `supabase/schema.sql` are designed to hold.
- Tags after the dash:
  - `phase-1` = do first, `phase-2` = next, `phase-3` = nice to have.
  - `frontend` `backend` `database` `auth` `ux` `player` `content` `accessibility` `performance` `testing` say what kind of work it is.
- To see one phase, search this file for its tag, for example `phase-1`.
- Add a due date at the end of a line when one matters, for example `(due 2026-10-31)`.

**Decisions so far:** sign-in is optional (anyone can browse); the catalog loads from Supabase and falls back to the bundled `catalog.js`; everything lives in the same Supabase project as the homework tables.

**Before real sign-ups work:** in the Supabase dashboard, under **Authentication → URL Configuration**, set the Site URL to where DramaStream is deployed, and add `http://localhost:5173/**` to Redirect URLs. Supabase's built-in email sender only delivers to the project team's own addresses, and only a few per hour. Real visitors need a custom SMTP server (**Authentication → Emails → SMTP Settings**); while testing, **Confirm email** can be turned off instead.

## 1. Catalog in Supabase

Move the catalog out of `src/data/catalog.js` so every other feature can query it.

- [x] Design `titles`, `genres`, `title_genres`, `seasons`, `episodes`, and `people`/`credits` tables. — `database` `phase-1`
- [x] Write a seed script that loads the 30 current titles from `catalog.js`. — `database` `content` `phase-1`
- [x] Add public read-only RLS policies for catalog tables. — `database` `auth` `phase-1`
- [x] Replace `catalog.js` lookups with Supabase queries and add loading and error states. — `frontend` `backend` `phase-1`
- [x] Keep search working against the database (partial and accent-insensitive). — `backend` `phase-1`
- [x] Add more titles so each row can scroll like Netflix (20+ per row). — `content` `phase-2` _(60 titles, 20 per row; artwork credited in `public/assets/CREDITS.md`.)_

## 2. Accounts and sign-in

Netflix requires an account before browsing.

- [x] Build a signed-out landing page with a hero, an email field, a **Get Started** button, and an FAQ accordion. — `frontend` `ux` `phase-1`
- [x] Add Supabase Auth sign-up, sign-in, sign-out, and password reset screens. — `auth` `frontend` `phase-1` _(Built and validated; a real sign-up needs Supabase's email settings, see the note at the top.)_
- [x] Protect browse, details, My List, and player routes so that signed-out visitors are sent to sign-in. — `auth` `frontend` `phase-1` _(Changed by decision: sign-in is optional, so browsing stays public; first-time visitors see the welcome page and `/account` requires sign-in.)_
- [x] Show the account menu in the header (profile icon, Account, Help, Sign out). — `frontend` `phase-1`
- [x] Add a mock plan-choice step (Basic / Standard / Premium), with no payment collected. — `frontend` `ux` `phase-3` _(Step 1 of Sign Up; changeable on Account. Free, no payment details.)_

## 3. Profiles ("Who's watching?")

Up to five profiles per account, each with its own list, progress and maturity level.

- [x] Add a `profiles` table (up to 5 per account: name, avatar, kids flag, maturity level, language). — `database` `phase-2`
- [x] Build the **Who's watching?** screen shown after sign-in. — `frontend` `ux` `phase-2` _(Built; not yet tried with a live account.)_
- [x] Build add, edit, and delete profile screens, plus **Manage Profiles** mode. — `frontend` `phase-2`
- [x] Add profile switching from the header menu. — `frontend` `phase-2`
- [x] Kids profile: show only titles at or below the chosen maturity rating, with a simpler header. — `frontend` `backend` `phase-2`
- [x] Optional profile lock with a 4-digit PIN. — `auth` `frontend` `phase-3` _(Stored only as a salted SHA-256 hash; asked for before watching or editing the profile.)_

## 4. My List saved per profile

My List survives a refresh and belongs to the profile that saved it.

- [x] Add a `my_list` table (profile, title, added_at) with a unique (profile, title) pair. — `database` `phase-1` _(Per user for now; becomes per profile with Profiles.)_
- [x] Replace the in-memory `MyListContext` with Supabase reads and writes; the list should survive a refresh. — `frontend` `backend` `phase-1` _(Signed out, it's saved in the browser; signed in, in Supabase.)_
- [x] Add a My List row on Home, newest first. — `frontend` `phase-1`
- [x] Add sort options on the My List page (Date added / A–Z). — `frontend` `phase-3` _(Plus Z–A and Release year.)_

## 5. Continue Watching and viewing progress

Viewers pick up where they left off, like Netflix's Continue Watching row.

- [x] Add a `viewing_progress` table (profile, title, episode, position_seconds, updated_at). — `database` `phase-1` _(Per user for now.)_
- [x] Save the mock player position every few seconds and when leaving the player. — `player` `backend` `phase-1`
- [x] Add a **Continue Watching for {profile}** row with a progress bar on each card. — `frontend` `phase-1`
- [x] **Resume** vs **Play** on title details, depending on saved progress. — `frontend` `player` `phase-1` _(Plus Start Over.)_
- [x] Add **Remove from row** on a Continue Watching card. — `frontend` `phase-2`
- [x] Add a viewing activity page (titles watched, with dates) under Account. — `frontend` `backend` `phase-3`

## 6. Home page rows like Netflix

More kinds of rows, ranked Top 10s, and hover cards.

- [x] Add more row types: Trending Now, New on DramaStream, Top 10 Today, a row per genre, and Because you watched {title}. — `frontend` `backend` `phase-2` _(Top 10 and Trending use anonymous play/add counts from `title_activity`, topped up with editors' picks until there's enough activity; "New on DramaStream" is New Releases by year.)_
- [x] Top 10 row with large rank numbers beside each poster. — `frontend` `ux` `phase-2`
- [x] Horizontal row scrolling with left and right arrows and a page indicator. — `frontend` `ux` `phase-1`
- [x] Hover card that expands after a short delay with Play, My List, Rate, More Info, match/maturity, length, and genres. — `frontend` `ux` `phase-2` _(Match % comes with the phase-3 recommendations task.)_
- [x] Header turns solid after scrolling (transparent over the hero). — `frontend` `ux` `phase-1`

## 7. Hero billboard

The big featured title at the top of Home.

- [x] Featured title rotates or is picked per visit from a "featured" flag in the database. — `frontend` `backend` `phase-2` _(The featured title on a first visit, then a different title each visit.)_
- [x] Muted autoplay trailer or animated still behind the billboard, with a mute toggle and a maturity rating badge. — `frontend` `player` `phase-3` _(Animated still — slow pan and zoom — with a simulated mute toggle; follows the profile's “Autoplay previews” setting and reduced-motion.)_
- [x] **Play** and **More Info** buttons; More Info opens the details modal. — `frontend` `phase-1`

## 8. Title details as a modal

On Netflix, details open as a modal over the browse page.

- [x] Open details as a modal over the current page, with the URL updated so it can be shared and Back closes it. — `frontend` `ux` `phase-2`
- [x] Keep `/titles/:id` working as a full page for direct links. — `frontend` `phase-2`
- [x] Modal sections: hero with Play / My List / Rate, synopsis, cast, genres, "This show is…" mood tags, Episodes, More Like This, About. — `frontend` `phase-2` _(Mood tags are derived from genres.)_
- [x] Trap focus inside the modal and close on Escape. — `accessibility` `phase-2`
- [x] **Trailer** button that plays the title's official trailer (YouTube embed, no video stored) in an accessible dialog, on desktop and phone, Coming Soon titles included. — `frontend` `database` `content` `accessibility` `phase-3` _(Keys from TMDB's official videos in `supabase/seed/trailers-research.json`; column added by `supabase/trailers.sql`. 57 of 66 titles have one.)_

## 9. Seasons and episodes

Series show every season and episode.

- [x] Store seasons and episodes for every series in the database. — `database` `content` `phase-2` _(433 episodes from TMDB: `supabase/seed/episodes.json` → `episodes.sql`.)_
- [x] Episode list on series details with a season dropdown, episode thumbnails, runtimes, and synopses. — `frontend` `phase-2` _(850 episodes across 20 series, each with its TMDB still and a synopsis written for this project.)_
- [x] Play a chosen episode in the player. — `player` `phase-2`

## 10. Player like Netflix

The mock player gets Netflix's controls and episode flow.

- [x] Back arrow, title and episode label, volume, fullscreen, and a speed menu. — `player` `frontend` `phase-2` _(Volume is simulated: the mock player has no sound.)_
- [x] Audio and subtitle menu (mock options from title data). — `player` `phase-3` _(Mock tracks; subtitles use the profile's language, size and style.)_
- [x] **Skip Intro** button during a set time window. — `player` `phase-3`
- [x] **Next Episode** button and an end-of-episode countdown that autoplays the next one, with a setting to turn autoplay off. — `player` `phase-2`
- [x] Controls hide after 3 seconds without mouse movement and reappear on movement. — `player` `ux` `phase-2` _(Already in the player.)_
- [x] More keyboard shortcuts: F fullscreen, M mute, ↑/↓ volume. — `player` `accessibility` `phase-2`

## 11. Search and browse

Find titles by more than their name, and browse by type and genre.

- [x] Search by title, cast, director, and genre, with live results in a grid. — `frontend` `backend` `phase-2`
- [x] Show "Explore titles related to…" suggestions above the results. — `frontend` `phase-3`
- [x] Add Browse pages: TV Shows, Movies, Documentaries, with a genre dropdown filter. — `frontend` `phase-2`
- [x] Add a **New & Popular** page with Coming Soon and a **Remind Me** button. — `frontend` `backend` `phase-3` _(Six Coming Soon titles with DramaStream's own arrival dates.)_

## 12. Ratings like Netflix

Ratings and reviews saved per profile and used for recommendations.

- [x] Decide whether to keep 1–5 stars or switch to Netflix's three options: Not for me, I like this, Love this. — `ux` `phase-2` _(Decided: Netflix's three options; old star ratings convert automatically.)_
- [x] Save ratings and reviews in Supabase per profile instead of `localStorage`. — `database` `backend` `phase-2`
- [x] Use ratings to fill the "Because you liked…" row and a match percentage. — `backend` `phase-3`

## 13. Account and settings

Account details and per-profile preferences.

- [x] Account page: email, a mock plan, a profiles list, and sign out of all devices. — `frontend` `auth` `phase-3`
- [x] Per-profile settings: language, autoplay next episode, autoplay previews, subtitle appearance, and maturity rating. — `frontend` `database` `phase-3`
- [x] Notifications bell for new arrivals and reminders. — `frontend` `backend` `phase-3`

## 14. Quality, accessibility, and launch

Tests, accessibility, performance and deployment.

- [x] Check against WCAG 2.2 AA: keyboard paths, focus, contrast, and screen-reader labels on every new screen. — `accessibility` `testing` `phase-1` _(axe-core: no violations on any page.)_
- [x] Add tests for each story's workflow (unit tests for data helpers, plus end-to-end tests for the main journeys). — `testing` `phase-1` _(`npm test`: 41 unit tests. `npm run test:e2e`: 18 Playwright journeys, desktop and phone.)_
- [x] Optimize images (responsive sizes, lazy loading) and keep `npm run build` passing. — `performance` `phase-2` _(`srcset` with smaller copies from `scripts/make-image-sizes.sh`; secondary pages lazy-loaded.)_
- [x] Run the Supabase security and performance advisors after every migration and fix the warnings. — `database` `testing` `phase-1` _(Security: clean. Performance: only unused-index notes on new tables.)_
- [ ] Deploy (for example Vercel or Netlify) with Supabase keys in environment variables. — `backend` `phase-2` _(Config is ready: `vercel.json`, `public/_redirects`, and the steps under **Deploy** in the README.)_
- [x] Update `README.md` and the screenshots. — `content` `phase-2`

## 15. Edge Functions and live TMDB data

The serverless-functions and 3rd-party-API assignments: Supabase Edge Functions that call TMDB without exposing its key.

- [x] Create and deploy a `hello-world` Edge Function that returns `{"message":"Hello World"}`. — `backend` `phase-2`
- [x] Create and deploy a `multiply-numbers` function (6 and 6 give `{"result":36}`), with 400 errors for missing or non-numeric input. — `backend` `phase-2` _(Accepts query parameters or a JSON body.)_
- [x] Keep the TMDB key in Supabase secrets (`TMDB_API_KEY`), never in the source or a `VITE_` variable; add `.env` to `.gitignore`. — `backend` `auth` `phase-1`
- [x] Add a `tmdb-search` function (CORS, 400 on a missing query, 502 when TMDB fails, trimmed results). — `backend` `phase-2`
- [x] Show a **More from TMDB** section on Search, debounced, hiding titles already in the catalog and tolerating TMDB failures. — `frontend` `ux` `phase-2`
- [x] Add a `tmdb-details` function (overview, genres, runtime or seasons, director or creator, top 12 cast; 404 for unknown ids). — `backend` `phase-2`
- [x] Add a TMDB details page at `/tmdb/:type/:id` with cast and the TMDB credit line, linked from the search cards. — `frontend` `ux` `phase-2`
- [x] Add a `tmdb-person` function (profile, bio, birth details, up to 20 best-known credits without talk-show or "Self" appearances; 404 for unknown ids). — `backend` `phase-2`
- [x] Add an actor page at `/person/:id`, reached by clicking any cast member, with known-for titles that open their TMDB details. — `frontend` `ux` `phase-2`
- [x] Hide TMDB content (search, details and actor pages) from Kids profiles (it has no maturity rating, and unrated titles count as adult). — `frontend` `auth` `phase-2`
- [x] Test it: unit tests for the trimming, auth and Kids rule, and Playwright journeys with the functions mocked. — `testing` `phase-2` _(56 unit tests, 26 end-to-end.)_
- [ ] Revoke the temporary Supabase CLI access token (`dramastream-cli`) once the project is finished. — `auth` `phase-1` _(It also expires 7 days after it was made. I decided to keep it until next week.)_
