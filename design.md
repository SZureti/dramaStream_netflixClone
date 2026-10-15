# DramaStream — Product and Design Plan

> **Project:** Netflix-inspired front-end SPA for the Code Platoon Netflix Clone I assignment  
> **Status:** Planning specification  
> **Working name:** DramaStream (replace with a name you prefer)  
> **Primary goal:** Study and recreate the structure of a streaming-media interface while presenting a personalized, small drama catalog.

## 1. Product summary

DramaStream is a responsive streaming-catalog prototype for viewers who enjoy drama. It presents **12 sample titles** in three categories—four drama films, four drama series, and four drama documentaries. A viewer can browse the catalog, search by title, inspect a title, save or remove it from My List, and open a mock playback screen.

This is a **front-end learning prototype**, not a streaming service. It does not host or stream complete films, authenticate users, charge subscriptions, or connect to a production catalog. The player demonstrates interface behavior using a placeholder visual and simulated controls.

## 2. Planning questions

| Question | Decision |
|---|---|
| What problem does it solve? | It gives drama viewers a clear place to browse a small, curated catalog, discover a title, and keep track of titles they want to watch. |
| Who uses it? | A viewer interested in drama films, drama series, and drama documentaries. The prototype supports one local, unauthenticated viewer. |
| What are their main goals? | Browse titles, find a title by name, review its details, save it to My List, and see how the playback experience would work. |
| What information do they need? | Title, artwork, synopsis, category/type, release year, content rating, runtime or seasons/episodes, and optionally director/creator and cast. |
| What actions can they perform? | Browse categories, search, open title details, add/remove titles from My List, start a mock player, pause/resume its simulated progress, seek, and return to the title. |
| What screens are required? | Browse/Home, Search results, Search no-results state, Title Details, My List (including its empty state), and Mock Playback. |
| What data must be collected or stored? | No personal information is collected. Local sample catalog records are read-only. The app keeps a set of saved title IDs in in-memory state; it resets on a full refresh. Playback time is temporary UI state. |
| What permissions or access rules exist? | No accounts, sign-in, or special permissions exist in this version. All catalog data is public sample content. There is only one local viewer state. |

## 3. Scope

### In scope

- Responsive single-page application with client-side navigation.
- Twelve catalog entries: four films, four series, and four documentaries.
- Home screen with a featured title and one row for each category. The featured title is one of the 12 entries, not a 13th title.
- Search by title, including partial and case-insensitive matches.
- Title detail view with core metadata and clear actions.
- My List add/remove behavior, duplicate prevention, and empty state.
- Mock playback with a placeholder image, play/pause, progress display, seeking, and skip controls if practical.
- Sample content and locally provided artwork.
- Responsive layout, keyboard access, and clear UI feedback.

### Out of scope for this version

- Actual movie or episode streaming, video hosting, or playback APIs.
- User accounts, passwords, profiles, subscriptions, payments, or protected content.
- Backend, database, external catalog API, recommendation engine, or analytics.
- Multiple profiles, parental controls, watch history, ratings, comments, downloads, or social features.
- Guarantee of TV-device compatibility. The layout should adapt to common screen widths, but TV remote navigation is not a requirement.

If the assignment repository or instructor gives a specific technical or feature requirement, follow that requirement over an assumption in this document.

## 4. Viewer journeys

### Journey 1 — Browse and inspect a title

1. The viewer opens Home and sees the featured drama title.
2. They scan the Drama Films, Drama Series, and Drama Documentaries rows.
3. They choose a title card.
4. The app opens that title’s detail view with matching artwork and information.
5. They return to the page they came from, or use the Home navigation item.

**Recovery/state:** If artwork is missing, show a neutral poster placeholder with the title text and meaningful alternative text. The rest of the card and detail page remain usable.

### Journey 2 — Search and save a title

1. The viewer opens Search and enters all or part of a title.
2. Matching titles appear across the catalog, with their category shown.
3. If nothing matches, the app displays “No titles found” and a Clear Search control.
4. The viewer opens a matching title’s details and selects Add to My List.
5. The action changes to Remove from My List, and the title appears on My List.
6. They can remove it later; the list updates immediately.

**Recovery/state:** Clearing a query restores the unfiltered search state. If My List has no saved titles, show an explanation and a Browse Titles action.

### Journey 3 — Open the mock player

1. The viewer opens a title’s details and selects Play.
2. The app opens Mock Playback for the selected title and displays its title and placeholder visual.
3. The viewer pauses or resumes simulated playback, seeks along the progress bar, or skips forward/back by 10 seconds if those controls are included.
4. The viewer selects Back to Details and returns to the same title.

**Boundary:** The screen must identify itself as a mock player. It must not imply that the film is actually streaming.

## 5. User stories and acceptance criteria

### Story A — Browse the catalog

**As a viewer, I want to browse drama films, series, and documentaries so I can find something I want to watch.**

- Home displays one featured title and three category rows.
- Each category has exactly four distinct titles; the featured title is included in one category row.
- Selecting a card opens details for that exact title.
- Returning from details restores the previous browsing context when possible.

### Story B — View title details

**As a viewer, I want to see a title’s details so I can decide whether to watch it.**

- Details show title, artwork, synopsis, type/category, year, content rating, and runtime or series episode information.
- The selected title’s content is consistent across Browse, Search, My List, Details, and Playback.
- Add to My List / Remove from My List reflects the current saved state.
- A visible back control returns to the previous view; a Home control provides a reliable fallback.

### Story C — Search the catalog

**As a viewer, I want to search by title so I can find a specific item.**

- Search trims leading and trailing whitespace and matches title text without case sensitivity.
- Partial title matches are supported.
- Each result shows its title and category/type.
- Selecting a result opens the correct details page.
- A non-matching query shows a no-results message and a working Clear Search control.

### Story D — Save a title

**As a viewer, I want to save a title to My List so I can find it again during this session.**

- Add to My List stores the title ID once; repeated activation does not create duplicates.
- The control changes to Remove from My List after saving.
- My List shows all saved titles with a route to each detail page.
- Removing a title updates My List and the detail action immediately.
- An empty list shows a clear message and a Browse Titles action.
- Saved titles reset after a full page refresh in this version.

### Story E — Use the mock player

**As a viewer, I want to open a title in a mock player so I can understand the intended playback flow.**

- Play opens the player for the selected title.
- The player names the title and labels the visual as a mock/preview placeholder.
- Play/Pause toggles state and updates its accessible name.
- The progress display changes while simulated playback is active; seeking updates the displayed time.
- The player stops at the selected title’s displayed duration and does not roll into another title.
- Back to Details returns to that title’s details.

## 6. Information architecture and routes

| Route | Screen | Behavior |
|---|---|---|
| `/` | Home / Browse | Featured item and three catalog rows. |
| `/search` | Search | Search input, results, or no-results state. Optionally keep the query in `?q=` so it survives route navigation. |
| `/titles/:titleId` | Title Details | Metadata and Add/Remove from My List, Play, and Back actions. |
| `/my-list` | My List | Saved titles or the empty-list state. |
| `/watch/:titleId` | Mock Playback | Simulated playback for a known title. |
| `*` | Not Found | Friendly message and link to Home for unknown routes or IDs. |

Keep navigation consistent across screens. On narrow screens, allow the navigation to wrap, collapse, or use an accessible menu; do not let it cover the page content.

## 7. Screen requirements

### Home / Browse

- Header with original working wordmark, Home, Search, and My List navigation.
- Featured panel using an entry from the 12-title catalog, with title, short synopsis, Play, and Add to My List.
- Three labeled rows: Drama Films, Drama Series, and Drama Documentaries. Each row contains four cards.
- Each card has poster artwork, title, and an accessible way to open details.
- On smaller viewports, rows may scroll horizontally with visible controls and keyboard-accessible focus; cards must not become too small to use.

### Search and results

- Labeled search input and clear control.
- Results update from the local catalog; a loading spinner is unnecessary for static local data.
- Results display title, artwork, type/category, and a Details action.
- Empty query shows a helpful prompt rather than an error.
- No-results state shows the query context, a plain-language message, and Clear Search.

### Title Details

- Artwork and title information in a clear hierarchy.
- Show category/type, year, content rating, and the correct duration fields for that type.
- Optional director/creator and cast may be included when reliable sample data exists.
- Play and Add/Remove from My List actions are visually distinct and keyboard accessible.
- Avoid inventing unavailable metadata. Use a placeholder or omit optional fields.

### My List

- Populated view uses the same title cards as Browse/Search.
- Empty view explains how to add titles and links to Home/Browse.
- Removing a title from details immediately updates this screen.

### Mock Playback

- Placeholder visual occupies the player area; include an explicit “Mock player — no video is streaming” label.
- Include title, Play/Pause, elapsed/duration, a seek slider, and optional 10-second skip controls.
- Use a `<button>` for actions and a labeled range input for seeking.
- Do not auto-play on route entry. Returning to Details exits the mock player.
- Playback progress is simulated UI state, not real media time.

## 8. Data model and sample content

Use a local JavaScript data module or JSON file. Keep all 12 records in one canonical catalog so cards, search, details, and My List share the same data.

```js
{
  id: "quiet-harbor",
  title: "The Quiet Harbor",
  type: "film", // "film" | "series" | "documentary"
  category: "Drama Films",
  synopsis: "A short, spoiler-light description.",
  releaseYear: 2023,
  contentRating: "PG-13",
  posterSrc: "/assets/posters/quiet-harbor.jpg",
  heroSrc: "/assets/hero/quiet-harbor.jpg", // optional; can reuse poster art
  runtimeMinutes: 108, // films and documentaries
  seasons: null, // series only
  episodeCount: null, // series only
  creator: "Sample Creator", // optional
  cast: ["Sample Actor One", "Sample Actor Two"] // optional
}
```

Data rules:

- Use exactly four records of each `type` and make every `id` unique.
- Films and documentaries have a runtime; series have season/episode information. Do not show a movie runtime for a series unless the field represents an episode runtime.
- Validate required display fields before rendering. If optional data is absent, omit that line rather than showing `undefined`, `null`, or invented values.
- Use local image assets so the app does not depend on an external image API. Prefer original, user-owned, or appropriately licensed artwork; keep filenames and attribution notes organized.
- Catalog records are read-only in the interface. My List stores IDs, not copied title objects.

## 9. State and behavior

- `catalog`: fixed 12-item data source.
- `searchQuery`: current search input; comparison is trimmed and case-insensitive.
- `savedTitleIds`: in-memory set/array shared by screens; reset on full refresh.
- `currentTitleId`: taken from the route for Details and Playback.
- `isPlaying`, `currentTime`: temporary mock-player state, reset when leaving/re-entering Playback unless choosing to preserve it in this session.
- Every route validates its title ID. Unknown IDs show the Not Found screen with a Home action.
- Buttons provide immediate feedback. Add/remove changes the label/state; play/pause changes the visible and accessible state.
- Do not simulate a network request or display a save-success claim for a local state change. A small “Added to My List” status message is optional.

## 10. Visual direction

Create an original cinematic interface using familiar streaming patterns without using Netflix’s official logo or presenting this project as an official Netflix product.

- **Canvas:** near-black / charcoal page background; lighter charcoal for cards and controls.
- **Text:** white for primary content, soft gray for supporting metadata; maintain readable contrast.
- **Accent:** one restrained red/coral accent for primary actions, focus highlights, and active navigation.
- **Typography:** bold, compact headings for titles; highly readable sans-serif for body and metadata.
- **Artwork:** use poster-shaped blocks with consistent crop ratios; use wide artwork for the featured panel when available.
- **Hierarchy:** title and primary action first; metadata and description second; secondary controls lower in the page.
- **Motion:** short, subtle hover/focus feedback only. Respect `prefers-reduced-motion`; no autoplaying hero media.
- **Responsive behavior:** keep desktop rows broad, adapt card widths on tablet, and make navigation/actions easy to reach on phone. Verify at approximately 1440px, 768px, and 390px widths.

## 11. Accessibility and interaction standards

- Use semantic landmarks, headings in order, and real buttons/links for actions/navigation.
- Give each poster informative alt text, such as `Poster for The Quiet Harbor`; if a nearby title already communicates the same content, avoid redundant text alternatives.
- Associate visible labels with search and playback controls.
- Ensure all routes and actions work by keyboard with visible focus.
- Do not communicate category, active state, or playback state using color alone.
- Provide clear focus order and adequate touch targets on mobile.
- Announce meaningful status changes (such as title added or removed) with an accessible status region when needed.
- Ensure modals are not required for core flows; if added, support focus management and Escape.

## 12. Suggested front-end structure

Adapt this to the assignment repository rather than replacing its setup blindly.

```text
src/
  app/
    App.jsx
    routes.jsx
  components/
    AppHeader.jsx
    FeaturedTitle.jsx
    TitleCard.jsx
    TitleRow.jsx
    SearchForm.jsx
    EmptyState.jsx
    MockPlayer.jsx
  data/
    catalog.js
  state/
    MyListContext.jsx
  pages/
    HomePage.jsx
    SearchPage.jsx
    TitleDetailsPage.jsx
    MyListPage.jsx
    PlayerPage.jsx
    NotFoundPage.jsx
  styles/
    global.css
    components.css
public/
  assets/
    posters/
    hero/
```

**Proposed stack:** React + Vite + React Router DOM with `BrowserRouter`, unless the assignment repo specifies another stack. No API or backend is needed for this scoped version.

## 13. Build phases and pass conditions

### Phase 0 — Inspect and confirm

- Inspect repository files, scripts, existing dependencies, and assignment requirements.
- Confirm the catalog, routes, data behavior, and screens before coding.
- **Pass:** no unresolved choice remains about whether real streaming, authentication, or external data is expected.

### Phase 1 — App shell and routes

- Create or adapt the app shell, header/navigation, route table, responsive baseline, and Not Found route.
- **Pass:** all routes render the correct page shell and navigation works by mouse and keyboard.

### Phase 2 — Catalog and Browse

- Add the 12 local records, featured panel, and three four-title rows.
- **Pass:** each title card opens its matching details route; categories have four titles each and no duplicate IDs.

### Phase 3 — Search and Details

- Add title search, results, no-results/clear behavior, and title detail display.
- **Pass:** partial/case-insensitive search behaves as specified; selected title metadata remains consistent.

### Phase 4 — My List and Mock Playback

- Add/remove list behavior, empty state, and mock player controls.
- **Pass:** list updates without duplicates; player controls change simulated state; leaving the player returns to details.

### Phase 5 — Responsive and quality pass

- Verify layout at phone/tablet/desktop widths, keyboard interaction, image fallbacks, and error/empty states.
- Compare implementation screens to the approved wireframes and make corrections.
- **Pass:** no clipped navigation or unusable controls; all acceptance criteria below pass.

At the end of each phase, review the result and agree on the next phase’s pass condition before continuing.

## 14. Final acceptance checklist

- [ ] Exactly 12 distinct catalog entries: 4 films, 4 series, and 4 documentaries.
- [ ] One featured title is reused from one of the category rows.
- [ ] Browse, Search, Details, My List, Playback, and Not Found routes work.
- [ ] Search handles partial matches, case differences, blank input, and no matches.
- [ ] Add/remove works consistently from every screen that exposes the action; no duplicates appear.
- [ ] My List empty state provides a path back to Browse.
- [ ] Player controls visibly work as a simulation and clearly disclose that no film is streaming.
- [ ] No real account credentials or personal data are requested.
- [ ] Artwork failures have a graceful fallback.
- [ ] Core flows work with keyboard and at narrow viewport widths.
- [ ] The app builds successfully using the repository’s documented command.
