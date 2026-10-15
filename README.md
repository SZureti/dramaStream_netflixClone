# DramaStream — Netflix-Inspired SPA

A responsive streaming-catalog prototype for the Code Platoon Netflix Clone I assignment, personalized around **drama films, drama series, and drama documentaries**. Built with React, Vite, and React Router.

> This is an educational, Netflix-inspired project. It is not affiliated with Netflix and does not stream full movies or episodes.

![DramaStream home page with the Breaking Bad featured banner](docs/screenshots/home.jpg)

## Features

- **Browse:** a featured hero banner plus three scrolling rows (Drama Films, Drama Series, Drama Documentaries) of 10 real titles each. Hover a poster for quick Play / My List / More Info actions.
- **Search:** live, case-insensitive, partial-title search (it ignores accents and punctuation, so “wont you” finds *Won’t You Be My Neighbor?*). The query stays in the URL (`?q=`). Includes a blank-query prompt and a “No titles found” state with Clear Search.
- **Title details:** poster, title logo, rating, runtime or seasons/episodes, genres, credits, cast, and “More like this”.
- **My List:** add or remove titles from anywhere, with no duplicates and an empty state that links back to Browse.
- **Rate:** give any title 1–5 stars. The details page shows the average and the number of ratings.
- **Review:** post a written review with a star rating and an optional display name. Your reviews appear under the title and can be deleted.
- **Share:** on phones, Share opens the system share sheet. On desktop it opens a menu with Copy link, X, Facebook, WhatsApp, and Email.
- **Mock player:** clearly labeled “Mock player — no video is streaming”. Has play/pause, a seek bar, ±10-second skips, and keyboard shortcuts (Space/K, ←/→). It never auto-plays and stops at the title’s real length. Series play their real first episode (for example, Breaking Bad S1:E1 “Pilot”, 59 min).
- **Not found:** a friendly page for unknown routes and unknown title IDs.
- **Responsive and accessible:** a bottom tab bar on phones, visible keyboard focus, labeled controls, status announcements, and reduced-motion support.

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
npm run dev
```

Open the local URL that Vite prints. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Routes

| Route | Screen |
|---|---|
| `/` | Home / Browse (`/#drama-films`, `/#drama-series`, `/#drama-documentaries` jump to a row) |
| `/search?q=` | Search and results |
| `/titles/:titleId` | Title details, ratings, reviews, and share |
| `/my-list` | My List |
| `/watch/:titleId` | Mock playback |
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

- **My List** and **mock playback** use in-memory state, so they reset on a full page refresh.
- **Ratings and reviews** are saved in this browser’s `localStorage` (key `dramastream:reviews:v1`) so they survive a refresh. They are never sent to a server, and other people can’t see them. Clear your browser’s site data to reset them.
- **Share** only opens links you choose (or your device’s share sheet). Nothing is posted automatically.
- There are no accounts and no backend. The app never collects email addresses, passwords, or payment details.

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
