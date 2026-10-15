/**
 * DramaStream catalog — the single source of truth for every screen.
 *
 * 12 real titles: 4 drama films, 4 drama series, 4 drama documentaries.
 * Facts (year, rating, runtime, seasons/episodes, credits) were checked against
 * TMDB (themoviedb.org); ratings for the two Netflix documentaries come from
 * Netflix's US title pages. Synopses are written for this project.
 * Artwork lives in /public/assets and is credited in /public/assets/CREDITS.md.
 */

export const TYPES = {
  film: { label: 'Film', category: 'Drama Films' },
  series: { label: 'Series', category: 'Drama Series' },
  documentary: { label: 'Documentary', category: 'Drama Documentaries' },
};

export const CATEGORIES = [
  {
    type: 'film',
    title: 'Drama Films',
    anchor: 'drama-films',
    blurb: 'Character-driven stories that stay with you long after the credits.',
  },
  {
    type: 'series',
    title: 'Drama Series',
    anchor: 'drama-series',
    blurb: 'Binge-worthy sagas of power, family, and ambition.',
  },
  {
    type: 'documentary',
    title: 'Drama Documentaries',
    anchor: 'drama-documentaries',
    blurb: 'True stories with all the tension of fiction.',
  },
];

const asset = (folder, id, ext = 'jpg') => `/assets/${folder}/${id}.${ext}`;

function makeTitle(record) {
  return Object.freeze({
    ...record,
    category: TYPES[record.type].category,
    posterSrc: asset('posters', record.id),
    heroSrc: asset('hero', record.id),
    logoSrc: asset('logos', record.id, 'png'),
  });
}

export const catalog = Object.freeze(
  [
    // ───────────── Drama Films ─────────────
    {
      id: 'shawshank-redemption',
      title: 'The Shawshank Redemption',
      type: 'film',
      synopsis:
        'Sentenced to life for a crime he insists he did not commit, soft-spoken banker Andy Dufresne arrives at Shawshank State Penitentiary in 1947. Over two decades behind its walls, an unlikely friendship with fellow inmate Red becomes a lesson in patience, dignity, and stubborn hope.',
      releaseYear: 1994,
      contentRating: 'R',
      runtimeMinutes: 142,
      genres: ['Drama', 'Crime'],
      credits: [
        { role: 'Director', names: ['Frank Darabont'] },
        { role: 'Based on the novella by', names: ['Stephen King'] },
      ],
      cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler', 'Clancy Brown'],
      heroPosition: '30% 30%',
    },
    {
      id: 'whiplash',
      title: 'Whiplash',
      type: 'film',
      synopsis:
        'Andrew, a first-year jazz drummer at an elite music conservatory, earns a seat in the studio band run by the brilliant and merciless Terence Fletcher. As rehearsal turns into obsession, Andrew has to decide how much of himself greatness is worth.',
      releaseYear: 2014,
      contentRating: 'R',
      runtimeMinutes: 107,
      genres: ['Drama', 'Music'],
      credits: [{ role: 'Director', names: ['Damien Chazelle'] }],
      cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser', 'Melissa Benoist'],
      heroPosition: '68% 30%',
    },
    {
      id: 'moonlight',
      title: 'Moonlight',
      type: 'film',
      synopsis:
        'Told in three chapters, Moonlight follows Chiron from a bullied childhood in Miami through a turbulent adolescence and into a guarded adulthood, as he searches for a sense of self and the courage to let someone truly see him.',
      releaseYear: 2016,
      contentRating: 'R',
      runtimeMinutes: 112,
      genres: ['Drama'],
      credits: [{ role: 'Director', names: ['Barry Jenkins'] }],
      cast: ['Trevante Rhodes', 'Ashton Sanders', 'Mahershala Ali', 'Naomie Harris', 'Janelle Monáe'],
      heroPosition: '42% 30%',
    },
    {
      id: 'past-lives',
      title: 'Past Lives',
      type: 'film',
      synopsis:
        'Nora and Hae Sung were inseparable as children in Seoul until her family emigrated. Twenty-four years later he visits her in New York, and over one quiet week the two old friends confront love, destiny, and the lives they did not get to live.',
      releaseYear: 2023,
      contentRating: 'PG-13',
      runtimeMinutes: 106,
      genres: ['Drama', 'Romance'],
      credits: [{ role: 'Director', names: ['Celine Song'] }],
      cast: ['Greta Lee', 'Teo Yoo', 'John Magaro'],
      heroPosition: '20% 40%',
    },

    // ───────────── Drama Series ─────────────
    {
      id: 'breaking-bad',
      title: 'Breaking Bad',
      type: 'series',
      synopsis:
        'When a mild-mannered Albuquerque chemistry teacher receives a terminal cancer diagnosis, he teams up with a former student to cook methamphetamine and secure his family’s future. Every choice pulls Walter White deeper into a criminal empire — and further from the man he used to be.',
      releaseYear: 2008,
      contentRating: 'TV-MA',
      seasons: 5,
      episodeCount: 62,
      firstEpisode: { season: 1, episode: 1, title: 'Pilot', runtimeMinutes: 59 },
      genres: ['Drama', 'Crime'],
      credits: [{ role: 'Created by', names: ['Vince Gilligan'] }],
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'RJ Mitte', 'Dean Norris'],
      heroPosition: '75% 25%',
    },
    {
      id: 'succession',
      title: 'Succession',
      type: 'series',
      synopsis:
        'Media titan Logan Roy controls one of the world’s largest entertainment conglomerates, and each of his four children wants a piece of it. As his health falters and his grip tightens, loyalty, ambition, and family become impossible to tell apart.',
      releaseYear: 2018,
      contentRating: 'TV-MA',
      seasons: 4,
      episodeCount: 39,
      firstEpisode: { season: 1, episode: 1, title: 'Celebration', runtimeMinutes: 62 },
      genres: ['Drama', 'Comedy'],
      credits: [{ role: 'Created by', names: ['Jesse Armstrong'] }],
      cast: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin', 'Matthew Macfadyen'],
      heroPosition: '50% 30%',
    },
    {
      id: 'the-crown',
      title: 'The Crown',
      type: 'series',
      synopsis:
        'Crowned at twenty-five, Elizabeth II must weigh private life against the duties of the monarchy as Britain changes around her. Spanning decades of political upheaval and family strain, the series imagines the conversations behind palace doors.',
      releaseYear: 2016,
      contentRating: 'TV-MA',
      seasons: 6,
      episodeCount: 60,
      firstEpisode: { season: 1, episode: 1, title: 'Wolferton Splash', runtimeMinutes: 57 },
      genres: ['Drama', 'History'],
      credits: [{ role: 'Created by', names: ['Peter Morgan'] }],
      cast: ['Claire Foy', 'Olivia Colman', 'Imelda Staunton', 'Vanessa Kirby', 'Jonathan Pryce'],
      heroPosition: '50% 40%',
    },
    {
      id: 'normal-people',
      title: 'Normal People',
      type: 'series',
      limitedSeries: true,
      synopsis:
        'In a small town in the west of Ireland, popular Connell and outsider Marianne begin a secret relationship in their final year of school. Through university in Dublin and beyond, they keep finding their way back to each other — even when they can’t say what they mean.',
      releaseYear: 2020,
      contentRating: 'TV-MA',
      seasons: 1,
      episodeCount: 12,
      firstEpisode: { season: 1, episode: 1, title: 'Episode 1', runtimeMinutes: 29 },
      genres: ['Drama', 'Romance'],
      credits: [
        { role: 'Directed by', names: ['Lenny Abrahamson', 'Hettie Macdonald'] },
        { role: 'Based on the novel by', names: ['Sally Rooney'] },
      ],
      cast: ['Daisy Edgar-Jones', 'Paul Mescal', 'Sarah Greene'],
      heroPosition: '62% 40%',
    },

    // ───────────── Drama Documentaries ─────────────
    {
      id: 'free-solo',
      title: 'Free Solo',
      type: 'documentary',
      synopsis:
        'Rock climber Alex Honnold prepares to scale the 3,000-foot granite face of El Capitan in Yosemite National Park — alone, with no rope and no protection. An intimate portrait of obsession, risk, and the people who love him while he chases an impossible goal.',
      releaseYear: 2018,
      contentRating: 'PG-13',
      runtimeMinutes: 100,
      genres: ['Documentary', 'Adventure'],
      credits: [{ role: 'Directed by', names: ['Elizabeth Chai Vasarhelyi', 'Jimmy Chin'] }],
      cast: ['Alex Honnold', 'Tommy Caldwell', 'Sanni McCandless'],
      castLabel: 'Featuring',
      heroPosition: '28% 50%',
    },
    {
      id: '13th',
      title: '13th',
      type: 'documentary',
      synopsis:
        'Ava DuVernay examines the clause in the Thirteenth Amendment that ended slavery “except as a punishment for crime.” Scholars, activists, and politicians trace a direct line from emancipation to the modern era of mass incarceration in the United States.',
      releaseYear: 2016,
      contentRating: 'TV-MA',
      runtimeMinutes: 100,
      genres: ['Documentary', 'History'],
      credits: [{ role: 'Director', names: ['Ava DuVernay'] }],
      cast: ['Angela Davis', 'Michelle Alexander', 'Cory Booker', 'Henry Louis Gates Jr.'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'my-octopus-teacher',
      title: 'My Octopus Teacher',
      type: 'documentary',
      synopsis:
        'Burned out and searching for meaning, filmmaker Craig Foster starts free-diving in a cold South African kelp forest, where he meets a curious young octopus. Over a year of daily visits, an extraordinary bond forms that changes how he sees the natural world — and himself.',
      releaseYear: 2020,
      contentRating: 'TV-PG',
      runtimeMinutes: 85,
      genres: ['Documentary', 'Nature'],
      credits: [{ role: 'Directed by', names: ['Pippa Ehrlich', 'James Reed'] }],
      cast: ['Craig Foster', 'Tom Foster'],
      castLabel: 'Featuring',
      heroPosition: '55% 40%',
    },
    {
      id: 'wont-you-be-my-neighbor',
      title: 'Won’t You Be My Neighbor?',
      type: 'documentary',
      synopsis:
        'For more than three decades, Fred Rogers used a modest children’s television show to talk honestly about feelings, fear, and kindness. Through archival footage and interviews, this documentary explores the gentle radical behind Mister Rogers’ Neighborhood.',
      releaseYear: 2018,
      contentRating: 'PG-13',
      runtimeMinutes: 95,
      genres: ['Documentary'],
      credits: [{ role: 'Director', names: ['Morgan Neville'] }],
      cast: ['Fred Rogers', 'Joanne Rogers', 'François Clemmons'],
      castLabel: 'Featuring',
      heroPosition: '72% 30%',
    },
  ].map(makeTitle),
);

/** The featured title is one of the 12 entries above — never a 13th record. */
export const FEATURED_TITLE_ID = 'breaking-bad';

const byId = new Map(catalog.map((t) => [t.id, t]));

export function getTitleById(id) {
  return byId.get(id) ?? null;
}

export function getFeaturedTitle() {
  return getTitleById(FEATURED_TITLE_ID);
}

export function getTitlesByType(type) {
  return catalog.filter((t) => t.type === type);
}

/** Lowercase, strip accents and punctuation so "wont you" finds "Won’t You…". */
export function normalizeForSearch(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`´"“”?!.,:;()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Trimmed, case-insensitive, partial title match. Empty query → no results. */
export function searchCatalog(query) {
  const q = normalizeForSearch(query);
  if (!q) return [];
  return catalog.filter((t) => normalizeForSearch(t.title).includes(q));
}

// ───────────── Display helpers ─────────────

export function formatRuntime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatSeasons(title) {
  if (!title.seasons) return null;
  if (title.limitedSeries) return 'Limited Series';
  return `${title.seasons} Season${title.seasons === 1 ? '' : 's'}`;
}

export function formatEpisodes(title) {
  if (!title.episodeCount) return null;
  return `${title.episodeCount} Episode${title.episodeCount === 1 ? '' : 's'}`;
}

/** Runtime for films/docs, seasons for series — never a movie runtime on a series. */
export function formatLength(title) {
  return title.type === 'series' ? formatSeasons(title) : formatRuntime(title.runtimeMinutes);
}

/** What the mock player plays: the film itself, or the series' first episode. */
export function getPlayable(title) {
  if (title.type === 'series' && title.firstEpisode) {
    const ep = title.firstEpisode;
    return {
      label: `S${ep.season}:E${ep.episode}`,
      subtitle: `“${ep.title}”`,
      durationSeconds: ep.runtimeMinutes * 60,
    };
  }
  return { label: null, subtitle: null, durationSeconds: (title.runtimeMinutes ?? 0) * 60 };
}

// ───────────── Dev-time data validation ─────────────

const REQUIRED = ['id', 'title', 'type', 'synopsis', 'releaseYear', 'contentRating'];

export function validateCatalog(items = catalog) {
  const problems = [];
  const ids = new Set();
  for (const t of items) {
    for (const key of REQUIRED) {
      if (t[key] === undefined || t[key] === null || t[key] === '') problems.push(`${t.id}: missing ${key}`);
    }
    if (ids.has(t.id)) problems.push(`duplicate id ${t.id}`);
    ids.add(t.id);
    if (!TYPES[t.type]) problems.push(`${t.id}: unknown type ${t.type}`);
    if (t.type === 'series' && !(t.seasons && t.episodeCount)) problems.push(`${t.id}: series needs seasons/episodeCount`);
    if (t.type !== 'series' && !t.runtimeMinutes) problems.push(`${t.id}: needs runtimeMinutes`);
  }
  for (const type of Object.keys(TYPES)) {
    const count = items.filter((t) => t.type === type).length;
    if (count !== 4) problems.push(`expected 4 ${type} titles, found ${count}`);
  }
  if (!items.some((t) => t.id === FEATURED_TITLE_ID)) problems.push('featured title is not in the catalog');
  return problems;
}

if (import.meta.env?.DEV) {
  const problems = validateCatalog();
  if (problems.length) console.warn('[catalog] data problems:', problems);
}
