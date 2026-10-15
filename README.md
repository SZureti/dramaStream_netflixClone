# DramaStream — Netflix-Inspired SPA

A responsive front-end streaming-catalog prototype for the Code Platoon Netflix Clone I assignment. The concept is personalized around **drama films, drama series, and drama documentaries**.

> This is an educational, Netflix-inspired project. It is not affiliated with Netflix and does not stream full movies or episodes.

## Project goal

Build a single-page application that demonstrates the structure and main interactions of a streaming platform:

- Browse a featured title and three catalog categories.
- Search for a title and review matching results.
- Open a title details screen.
- Add or remove titles from My List.
- Open a clearly labeled mock playback screen.

## Catalog scope

The sample catalog contains **12 distinct titles**:

- 4 Drama Films
- 4 Drama Series
- 4 Drama Documentaries

The featured title is one of those 12 titles and appears in its category row. Each record includes title, artwork, synopsis, release year, content rating, and the appropriate runtime or episode details.

The catalog uses real, well-known titles (data lives in `src/data/catalog.js`):

| Drama Films | Drama Series | Drama Documentaries |
|---|---|---|
| The Shawshank Redemption (1994, R) | **Breaking Bad** (2008, TV-MA) — *featured* | Free Solo (2018, PG-13) |
| Whiplash (2014, R) | Succession (2018, TV-MA) | 13th (2016, TV-MA) |
| Moonlight (2016, R) | The Crown (2016, TV-MA) | My Octopus Teacher (2020, TV-PG) |
| Past Lives (2023, PG-13) | Normal People (2020, TV-MA) | Won’t You Be My Neighbor? (2018, PG-13) |

## Screens

- **Home / Browse:** featured title and the three four-title rows.
- **Search:** matching results, blank-query prompt, and no-results state.
- **Title Details:** artwork, summary, metadata, Play, and Add/Remove from My List.
- **My List:** saved titles or an empty state with a Browse action.
- **Mock Playback:** placeholder visual with simulated Play/Pause and progress controls.
- **Not Found:** a friendly fallback for an unknown route or title ID.

See [`design.md`](./design.md) for the full product plan, planning questions, user journeys, user stories, acceptance criteria, data model, accessibility guidance, and build phases.

## Technical plan

**Proposed stack:** React + Vite + React Router DOM with `BrowserRouter`, unless the assignment repository specifies a different setup. Use a local catalog data file; this version does not require an API, backend, or database.

**State behavior:** My List and mock playback use in-memory UI state. Saved titles reset after a full page refresh. No real email, password, account, or payment information is collected.

## Start the app

If the assignment repository is set up as a standard Vite project:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```bash
npm run build
npm run preview
```

Check the repository’s existing `package.json` and assignment instructions before running commands. Keep any required starter setup and dependencies intact.

## Suggested routes

| Route | Screen |
|---|---|
| `/` | Home / Browse |
| `/search` | Search and results |
| `/titles/:titleId` | Title Details |
| `/my-list` | My List |
| `/watch/:titleId` | Mock Playback |
| `*` | Not Found |

## Suggested project structure

```text
src/
  app/
  components/
  data/catalog.js
  pages/
  state/MyListContext.jsx
  styles/
public/assets/
  posters/
  hero/
```

Adapt this layout to the actual starter repository instead of replacing its structure without inspection.

## Build order

1. Inspect the assignment repo and confirm requirements, existing scripts, and dependencies.
2. Build the app shell and routes.
3. Add the 12-title catalog and Browse screen.
4. Add Search and Title Details.
5. Add My List and mock playback.
6. Check responsive behavior, keyboard access, empty/error states, and wireframe alignment.

Each phase should have a reviewable pass condition before moving to the next. The complete criteria are in `design.md`.

## Artwork

Each title has three local images under `public/assets/`: a poster (`posters/`), a wide background still (`hero/`, resized to 1920px), and its title logo (`logos/`). They were downloaded once from TMDB's image CDN for this educational project; sources are listed in [`public/assets/CREDITS.md`](./public/assets/CREDITS.md). Posters have descriptive alt text, and every image falls back to a neutral placeholder with the title text if it fails to load. The running app does not call an external image or media API.

## Quality checklist

- All 12 titles have unique IDs and appear in the correct category.
- The featured title is not counted as a thirteenth catalog entry.
- Search handles partial/case-insensitive matches and displays a useful no-results state.
- My List prevents duplicates and has an empty state.
- Mock playback controls change the visible simulated state and do not imply real streaming.
- Navigation and controls work with keyboard and at phone, tablet, and desktop widths.
- `npm run build` completes successfully using the project’s actual scripts.
