# DramaStream — Netflix-Inspired SPA

A responsive streaming-catalog prototype for the Code Platoon Netflix Clone I assignment, personalized around **drama films, drama series, and drama documentaries**. Built with React, Vite, and React Router.

> This is an educational, Netflix-inspired project. It is not affiliated with Netflix and does not stream full movies or episodes.

![DramaStream home page with the Breaking Bad featured banner](docs/screenshots/home.jpg)

## Features

- **Home like Netflix:** a billboard that rotates each visit, then rows for Continue Watching, Top 10 on DramaStream Today (with big rank numbers), My List, Trending Now, New Releases, Because you watched…, genre rows, and Drama Films / Series / Documentaries. Rows scroll with arrows and a page indicator. Hovering a poster for a moment reveals Play, My List, Rate, More Info, maturity, length and genres.
- **Title details as a modal:** opening a title shows its details over the page you were on, with Play/Resume, My List, Rate, cast, genres, mood tags, the episode list (series), More Like This and About. The URL changes so it can be shared, and Back or Escape closes it. Opening a `/titles/…` link directly shows the full page, with ratings, reviews and sharing.
- **Accounts and profiles (optional):** browse freely without an account. Signing in (Supabase Auth) adds Netflix-style profiles, up to five per account, including kids profiles that only show titles at or below a maturity level. My List, Continue Watching, ratings and reviews belong to the profile.
- **Search and browse:** live search by title, actor, director or genre (accent- and punctuation-insensitive), with "Explore titles related to" suggestions. TV Shows, Movies and Documentaries pages filter by genre.
- **Continue Watching:** the mock player saves where you stopped. Details show Resume and Start Over, and cards show a progress bar and "Remove from row".
- **Ratings like Netflix:** Not for me / I like this / Love this, plus written reviews (private to you).
- **Mock player:** clearly labeled "Mock player — no video is streaming". It has play/pause, seek, ±10 s, playback speed, simulated volume and mute, full screen, Skip Intro, Next Episode with an autoplay countdown (a per-profile setting), and keyboard shortcuts: Space/K, ←/→, F, M, ↑/↓.
- **Share:** the system share sheet on phones; on desktop, a menu with Copy link, X, Facebook, WhatsApp and Email.
- **Responsive and accessible:** a bottom tab bar on phones, visible focus, labeled controls, announced status messages, and reduced-motion support. axe-core reports no WCAG 2.2 AA violations.

## Screenshots

| | |
|---|---|
| ![Rows of drama films and series posters](docs/screenshots/rows.jpg) | ![The Godfather title details page](docs/screenshots/details.jpg) |
| **Browse rows:** 10 titles per category | **Title details** |
| ![Ratings and reviews section with a posted review](docs/screenshots/reviews.jpg) | ![Share menu open on a title](docs/screenshots/share.jpg) |
| **Ratings & reviews** | **Share menu** |
| ![Search results for “the”](docs/screenshots/search.jpg) | ![My List with three saved titles](docs/screenshots/my-list.jpg) |
| **Search** | **My List** |
| ![Mock player for Chernobyl](docs/screenshots/player.jpg) | <img src="docs/screenshots/mobile-home.jpg" alt="Home page on a phone" width="260"> |
| **Mock player** | **Phone layout** |

## Catalog

30 real titles, 10 per category. The data lives in `src/data/catalog.js`, and **Breaking Bad** is the featured title.

| Drama Films | Drama Series | Drama Documentaries |
|---|---|---|
| The Shawshank Redemption (1994, R) | **Breaking Bad** (2008, TV-MA) | Free Solo (2018, PG-13) |
| Whiplash (2014, R) | Succession (2018, TV-MA) | 13th (2016, TV-MA) |
| Moonlight (2016, R) | The Crown (2016, TV-MA) | My Octopus Teacher (2020, TV-PG) |
| Past Lives (2023, PG-13) | Normal People (2020, TV-MA) | Won’t You Be My Neighbor? (2018, PG-13) |
| The Godfather (1972, R) | Better Call Saul (2015, TV-MA) | Man on Wire (2008, PG-13) |
| Schindler’s List (1993, R) | Mad Men (2007, TV-14) | Searching for Sugar Man (2012, PG-13) |
| Manchester by the Sea (2016, R) | Chernobyl (2019, TV-MA) | Jiro Dreams of Sushi (2011, PG) |
| Marriage Story (2019, R) | The Sopranos (1999, TV-MA) | Icarus (2017, NR) |
| Nomadland (2021, R) | Mare of Easttown (2021, TV-MA) | Senna (2010, PG-13) |
| Oppenheimer (2023, R) | The Queen’s Gambit (2020, TV-MA) | American Factory (2019, NR) |

Year, rating, runtime, seasons/episodes, and credits were checked against TMDB. The synopses were written for this project.

## Start the app

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and publishable key
npm run dev
```

Without `.env.local` the site still runs: it uses the bundled catalog, and the account features are hidden.

Run the unit tests with `npm test`.

Open the local URL that Vite prints. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Deploy

The app is a static single-page app; Supabase is the backend. Both Vercel and Netlify work. Every route falls back to `index.html` (`vercel.json` for Vercel, `public/_redirects` for Netlify).

1. Push the repo to GitHub.
2. **Vercel:** New Project → import the repo (it detects Vite: build `npm run build`, output `dist`). **Netlify:** Add new site → import the repo, build command `npm run build`, publish directory `dist`.
3. Add two environment variables with the same values as `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (the publishable key only, never the secret/service-role key)
4. Deploy, then in Supabase → **Authentication → URL Configuration**:
   - set **Site URL** to the deployed address;
   - add `https://YOUR-SITE/**` to **Redirect URLs**, so sign-up confirmation and password-reset links come back to the site.
5. Real visitors only get sign-up emails once you add your own SMTP under **Authentication → Emails** (Supabase's built-in sender only mails your team).

After adding artwork, run `sh scripts/make-image-sizes.sh` (macOS) to create the smaller copies the site serves on small screens.

## Routes

| Route | Screen |
|---|---|
| `/` | Home (`/#drama-films`, `/#drama-series`, `/#drama-documentaries` jump to a row) |
| `/browse/series`, `/browse/films`, `/browse/documentaries` | TV Shows, Movies, Documentaries (`?genre=` filter) |
| `/search?q=` | Search and results |
| `/titles/:titleId` | Title details: a modal when opened in the app, a full page for direct links |
| `/my-list` | My List |
| `/watch/:titleId` | Mock playback (resumes where you left off; `?s=&e=` picks an episode, `?t=0` starts over) |
| `/welcome` | Signed-out landing page (first visit) |
| `/signin`, `/signup` | Sign in / create an account |
| `/forgot-password`, `/reset-password` | Password reset |
| `/account` | Account (signed in only) |
| `/profiles`, `/profiles/new`, `/profiles/:id/edit` | Who's watching? and profile settings (signed in only) |
| `/help` | FAQ |
| `*` | Not Found |

## Project structure

```text
src/
  app/          App.jsx (routes + layout), RouteEffects.jsx (scroll & focus on navigation)
  components/   AppHeader, FeaturedTitle, TitleRow, TitleCard, MyListButton, ShareButton,
                StarRating, ReviewsSection, MockPlayer, SearchForm, SmartImage, EmptyState, Icons…
  data/         catalog.js — the single catalog plus search/format helpers and data validation
  pages/        Home, Search, TitleDetails, MyList, Player, NotFound
  state/        MyListContext, ReviewsContext, StatusContext (toast + screen-reader announcements)
  styles/       global.css (tokens, base, buttons), components.css
public/assets/  posters/, hero/, logos/, CREDITS.md
docs/screenshots/
```

## State and privacy

- **Catalog:** loaded from Supabase (tables `titles`, `genres`, `credits`, `seasons`, `episodes`, …). If Supabase can't be reached, the bundled `src/data/catalog.js` is used, so the site never goes blank.
- **Accounts are optional.** Signed out, **My List** and **Continue Watching** are saved in this browser's `localStorage`. Signed in (Supabase Auth), they're saved to your account (tables `my_list` and `viewing_progress`, protected by Row Level Security so only you can see them). Anything saved before signing in is merged into the account.
- **Ratings and reviews** are saved in this browser’s `localStorage` (key `dramastream:reviews:v1`) so they survive a refresh. They are never sent to a server, and other people can’t see them. Clear your browser’s site data to reset them.
- **Share** only opens links you choose (or your device’s share sheet). Nothing is posted automatically.
- Accounts store only an email address (and Supabase's hashed password). The app never collects payment details.

## Artwork

Each title has three local images under `public/assets/`: a poster (`posters/`), a wide background still (`hero/`, resized to 1920px), and its title logo (`logos/`). They were downloaded once from TMDB’s image CDN for this educational project. Sources are listed in [`public/assets/CREDITS.md`](./public/assets/CREDITS.md). Every image falls back to a neutral placeholder showing the title text if it fails to load. The running app does not call any external image or media API.

## Planning docs

See [`design.md`](./design.md) for the original product plan, user stories, acceptance criteria, and accessibility guidance, and [`Plan/Plan.md`](./Plan/Plan.md) for the planning questions. The build has since grown beyond that first scope: 30 real titles instead of 12 fictional ones, plus ratings, reviews, and sharing.

## Quality checklist

- Every title has a unique ID and appears in the correct category. The featured title is one of the 30, not an extra entry.
- Search handles partial and case-insensitive matches and shows a useful no-results state.
- My List prevents duplicates and has an empty state.
- Ratings require 1–5 stars, and reviews require at least 10 characters. Validation errors are announced.
- Mock playback controls change the visible simulated state and never imply real streaming.
- Navigation and controls work with the keyboard and at phone (390px), tablet (768px), and desktop (1440px) widths.
- `npm run build` completes successfully.
