/**
 * DramaStream catalog — the single source of truth for every screen.
 *
 * 30 real titles: 10 drama films, 10 drama series, 10 drama documentaries.
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
  // Series list every stored episode; the bundled data only knows the first.
  const episodes =
    record.type === 'series'
      ? (record.episodes ?? (record.firstEpisode ? [{ ...record.firstEpisode }] : []))
      : undefined;
  return Object.freeze({
    ...record,
    ...(episodes ? { episodes } : {}),
    category: TYPES[record.type].category,
    posterSrc: asset('posters', record.id),
    // Smaller copies from scripts/make-image-sizes.sh, for srcset.
    posterSmallSrc: asset('posters/400', record.id),
    posterSrcSet: `${asset('posters/400', record.id)} 400w, ${asset('posters', record.id)} 780w`,
    heroSrc: asset('hero', record.id),
    heroSmallSrc: asset('hero/960', record.id),
    heroSrcSet: `${asset('hero/960', record.id)} 960w, ${asset('hero', record.id)} 1920w`,
    logoSrc: asset('logos', record.id, 'png'),
  });
}

/**
 * The bundled catalog. The site renders it immediately, then swaps in the
 * Supabase copy once it loads (src/data/remoteCatalog.js). If Supabase can't
 * be reached, this stays in place, so the site never goes blank.
 */
export const LOCAL_CATALOG = Object.freeze(
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

    // ───────────── More Drama Films ─────────────
    {
      id: 'the-godfather',
      title: 'The Godfather',
      type: 'film',
      synopsis:
        'When aging patriarch Vito Corleone is targeted by a rival family, his youngest son Michael — the one who swore to stay out of the family business — is drawn into a war that will decide who he becomes.',
      releaseYear: 1972,
      contentRating: 'R',
      runtimeMinutes: 175,
      genres: ['Drama', 'Crime'],
      credits: [
        { role: 'Director', names: ['Francis Ford Coppola'] },
        { role: 'Based on the novel by', names: ['Mario Puzo'] },
      ],
      cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Robert Duvall'],
      heroPosition: '50% 30%',
    },
    {
      id: 'schindlers-list',
      title: 'Schindler’s List',
      type: 'film',
      synopsis:
        'In occupied Poland, opportunistic businessman Oskar Schindler staffs his factory with Jewish workers for cheap labor — until the horror unfolding around him turns profit into a desperate effort to save as many lives as he can.',
      releaseYear: 1993,
      contentRating: 'R',
      runtimeMinutes: 195,
      genres: ['Drama', 'History', 'War'],
      credits: [
        { role: 'Director', names: ['Steven Spielberg'] },
        { role: 'Based on the novel by', names: ['Thomas Keneally'] },
      ],
      cast: ['Liam Neeson', 'Ben Kingsley', 'Ralph Fiennes'],
      heroPosition: '50% 30%',
    },
    {
      id: 'manchester-by-the-sea',
      title: 'Manchester by the Sea',
      type: 'film',
      synopsis:
        'A withdrawn Boston handyman returns to his coastal hometown after his brother’s death and learns he has been named guardian of his teenage nephew — forcing him to face the past he left behind.',
      releaseYear: 2016,
      contentRating: 'R',
      runtimeMinutes: 138,
      genres: ['Drama'],
      credits: [{ role: 'Director', names: ['Kenneth Lonergan'] }],
      cast: ['Casey Affleck', 'Lucas Hedges', 'Michelle Williams', 'Kyle Chandler'],
      heroPosition: '50% 35%',
    },
    {
      id: 'marriage-story',
      title: 'Marriage Story',
      type: 'film',
      synopsis:
        'A theater director and an actor try to part ways gently, but a bicoastal divorce pulls in lawyers, pride, and their young son — testing how much love can survive the ending of a marriage.',
      releaseYear: 2019,
      contentRating: 'R',
      runtimeMinutes: 137,
      genres: ['Drama'],
      credits: [{ role: 'Director', names: ['Noah Baumbach'] }],
      cast: ['Adam Driver', 'Scarlett Johansson', 'Laura Dern', 'Alan Alda'],
      heroPosition: '50% 35%',
    },
    {
      id: 'nomadland',
      title: 'Nomadland',
      type: 'film',
      synopsis:
        'After the economic collapse of her company town, a widow packs her life into a van and drives west, finding work, solitude, and an unexpected community among modern-day nomads.',
      releaseYear: 2021,
      contentRating: 'R',
      runtimeMinutes: 108,
      genres: ['Drama'],
      credits: [{ role: 'Director', names: ['Chloé Zhao'] }],
      cast: ['Frances McDormand', 'David Strathairn'],
      heroPosition: '50% 40%',
    },
    {
      id: 'oppenheimer',
      title: 'Oppenheimer',
      type: 'film',
      synopsis:
        'The story of physicist J. Robert Oppenheimer, who led the secret wartime race to build the atomic bomb — and then lived with what his success had unleashed on the world.',
      releaseYear: 2023,
      contentRating: 'R',
      runtimeMinutes: 181,
      genres: ['Drama', 'History'],
      credits: [{ role: 'Director', names: ['Christopher Nolan'] }],
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
      heroPosition: '50% 30%',
    },

    // ───────────── More Drama Series ─────────────
    {
      id: 'better-call-saul',
      title: 'Better Call Saul',
      type: 'series',
      synopsis:
        'Years before Breaking Bad, struggling lawyer Jimmy McGill hustles for clients in Albuquerque, and every shortcut he takes edges him closer to becoming the criminal attorney Saul Goodman.',
      releaseYear: 2015,
      contentRating: 'TV-MA',
      seasons: 6,
      episodeCount: 63,
      firstEpisode: { season: 1, episode: 1, title: 'Uno', runtimeMinutes: 54 },
      genres: ['Drama', 'Crime'],
      credits: [{ role: 'Created by', names: ['Vince Gilligan', 'Peter Gould'] }],
      cast: ['Bob Odenkirk', 'Rhea Seehorn', 'Jonathan Banks', 'Patrick Fabian'],
      heroPosition: '50% 30%',
    },
    {
      id: 'mad-men',
      title: 'Mad Men',
      type: 'series',
      synopsis:
        'On Madison Avenue in the 1960s, brilliant ad man Don Draper sells dreams to America while guarding a carefully constructed identity — as the decade transforms everyone around him.',
      releaseYear: 2007,
      contentRating: 'TV-14',
      seasons: 7,
      episodeCount: 92,
      firstEpisode: { season: 1, episode: 1, title: 'Smoke Gets in Your Eyes', runtimeMinutes: 49 },
      genres: ['Drama'],
      credits: [{ role: 'Created by', names: ['Matthew Weiner'] }],
      cast: ['Jon Hamm', 'Elisabeth Moss', 'January Jones', 'Vincent Kartheiser'],
      heroPosition: '50% 30%',
    },
    {
      id: 'chernobyl',
      title: 'Chernobyl',
      type: 'series',
      limitedSeries: true,
      synopsis:
        'In April 1986, a reactor explodes at the Chernobyl nuclear plant. Scientists, officials, and ordinary workers race to contain the disaster while the Soviet state works just as hard to contain the truth.',
      releaseYear: 2019,
      contentRating: 'TV-MA',
      seasons: 1,
      episodeCount: 5,
      firstEpisode: { season: 1, episode: 1, title: '1:23:45', runtimeMinutes: 61 },
      genres: ['Drama', 'History'],
      credits: [{ role: 'Created by', names: ['Craig Mazin'] }],
      cast: ['Jared Harris', 'Stellan Skarsgård', 'Emily Watson', 'Paul Ritter'],
      heroPosition: '50% 35%',
    },
    {
      id: 'the-sopranos',
      title: 'The Sopranos',
      type: 'series',
      synopsis:
        'New Jersey mob boss Tony Soprano starts seeing a psychiatrist after a series of panic attacks, and therapy becomes one more place where his two families — and his two selves — collide.',
      releaseYear: 1999,
      contentRating: 'TV-MA',
      seasons: 6,
      episodeCount: 86,
      firstEpisode: { season: 1, episode: 1, title: 'The Sopranos', runtimeMinutes: 60 },
      genres: ['Drama', 'Crime'],
      credits: [{ role: 'Created by', names: ['David Chase'] }],
      cast: ['James Gandolfini', 'Edie Falco', 'Jamie-Lynn Sigler', 'Robert Iler'],
      heroPosition: '50% 30%',
    },
    {
      id: 'mare-of-easttown',
      title: 'Mare of Easttown',
      type: 'series',
      limitedSeries: true,
      synopsis:
        'A small-town Pennsylvania detective, once a local basketball hero, investigates a young mother’s murder while her own life and family quietly fall apart around her.',
      releaseYear: 2021,
      contentRating: 'TV-MA',
      seasons: 1,
      episodeCount: 7,
      firstEpisode: { season: 1, episode: 1, title: 'Miss Lady Hawk Herself', runtimeMinutes: 58 },
      genres: ['Drama', 'Crime', 'Mystery'],
      credits: [{ role: 'Created by', names: ['Brad Ingelsby'] }],
      cast: ['Kate Winslet', 'Jean Smart', 'Julianne Nicholson', 'Angourie Rice'],
      heroPosition: '50% 35%',
    },
    {
      id: 'the-queens-gambit',
      title: 'The Queen’s Gambit',
      type: 'series',
      limitedSeries: true,
      synopsis:
        'Orphaned at nine, Beth Harmon learns chess from a janitor in a basement — and grows into a prodigy fighting her way to the top of a male-dominated game while battling her own dependencies.',
      releaseYear: 2020,
      contentRating: 'TV-MA',
      seasons: 1,
      episodeCount: 7,
      firstEpisode: { season: 1, episode: 1, title: 'Openings', runtimeMinutes: 59 },
      genres: ['Drama'],
      credits: [{ role: 'Created by', names: ['Scott Frank', 'Allan Scott'] }],
      cast: ['Anya Taylor-Joy', 'Marielle Heller', 'Thomas Brodie-Sangster', 'Harry Melling'],
      heroPosition: '50% 30%',
    },

    // ───────────── More Drama Documentaries ─────────────
    {
      id: 'man-on-wire',
      title: 'Man on Wire',
      type: 'documentary',
      synopsis:
        'In 1974, French high-wire artist Philippe Petit and a small band of friends sneak into the unfinished World Trade Center to string a cable between the Twin Towers — and attempt the impossible walk.',
      releaseYear: 2008,
      contentRating: 'PG-13',
      runtimeMinutes: 94,
      genres: ['Documentary'],
      credits: [{ role: 'Director', names: ['James Marsh'] }],
      cast: ['Philippe Petit', 'Jean-Louis Blondeau', 'Annie Allix'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'searching-for-sugar-man',
      title: 'Searching for Sugar Man',
      type: 'documentary',
      synopsis:
        'A Detroit singer-songwriter vanished after two overlooked albums — unaware that he had become a legend in apartheid-era South Africa. Two fans set out to learn what really happened to him.',
      releaseYear: 2012,
      contentRating: 'PG-13',
      runtimeMinutes: 85,
      genres: ['Documentary', 'Music'],
      credits: [{ role: 'Director', names: ['Malik Bendjelloul'] }],
      cast: ['Sixto Rodriguez', 'Stephen Segerman'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'jiro-dreams-of-sushi',
      title: 'Jiro Dreams of Sushi',
      type: 'documentary',
      synopsis:
        'Inside a ten-seat Tokyo restaurant, an 85-year-old sushi master pursues perfection one piece at a time, while his eldest son waits for the day he will inherit his father’s legacy.',
      releaseYear: 2011,
      contentRating: 'PG',
      runtimeMinutes: 82,
      genres: ['Documentary'],
      credits: [{ role: 'Director', names: ['David Gelb'] }],
      cast: ['Jiro Ono', 'Yoshikazu Ono'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'icarus',
      title: 'Icarus',
      type: 'documentary',
      synopsis:
        'A filmmaker sets out to test how easy it is to beat cycling’s doping controls, and his Russian adviser ends up at the center of an international scandal that reaches the highest levels of sport and state.',
      releaseYear: 2017,
      contentRating: 'NR',
      runtimeMinutes: 121,
      genres: ['Documentary'],
      credits: [{ role: 'Director', names: ['Bryan Fogel'] }],
      cast: ['Bryan Fogel', 'Grigory Rodchenkov'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'senna',
      title: 'Senna',
      type: 'documentary',
      synopsis:
        'Told entirely through archival footage, the life of Brazilian Formula One champion Ayrton Senna — his fierce rivalry with Alain Prost, his faith, and his fight against the politics of the sport.',
      releaseYear: 2010,
      contentRating: 'PG-13',
      runtimeMinutes: 106,
      genres: ['Documentary'],
      credits: [{ role: 'Director', names: ['Asif Kapadia'] }],
      cast: ['Ayrton Senna', 'Alain Prost'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
    {
      id: 'american-factory',
      title: 'American Factory',
      type: 'documentary',
      synopsis:
        'When a Chinese billionaire reopens a shuttered General Motors plant in Ohio, hopeful local workers and transplanted Chinese staff collide over culture, pay, and what a good job is supposed to look like.',
      releaseYear: 2019,
      contentRating: 'NR',
      runtimeMinutes: 110,
      genres: ['Documentary'],
      credits: [{ role: 'Directed by', names: ['Julia Reichert', 'Steven Bognar'] }],
      cast: ['Junming “Jimmy” Wang', 'Sherrod Brown'],
      castLabel: 'Featuring',
      heroPosition: '50% 40%',
    },
  ].map(makeTitle),
);

/** The featured title is one of the catalog entries above — never an extra record. */
export const FEATURED_TITLE_ID = 'breaking-bad';

// ───────────── The current catalog (local, or the Supabase copy) ─────────────

let current = { titles: LOCAL_CATALOG, featuredId: FEATURED_TITLE_ID, source: 'local' };
let byId = new Map(LOCAL_CATALOG.map((t) => [t.id, t]));
const listeners = new Set();

// ───────────── Maturity (profiles) ─────────────
// Netflix's four levels; each rating belongs to the lowest level that shows it.
const LEVELS = { 'little-kids': 0, 'older-kids': 1, teens: 2, all: 3 };
const RATING_LEVEL = {
  'TV-Y': 0,
  G: 0,
  'TV-G': 0,
  'TV-Y7': 1,
  PG: 1,
  'TV-PG': 1,
  'PG-13': 2,
  'TV-14': 2,
  R: 3,
  'NC-17': 3,
  'TV-MA': 3,
  NR: 3,
};
let maxLevel = LEVELS.all;

/** Limit what the catalog shows to a profile's maturity level ('all' shows everything). */
export function setMaturityLimit(level) {
  const next = LEVELS[level] ?? LEVELS.all;
  if (next === maxLevel) return;
  maxLevel = next;
  current = { ...current }; // new snapshot so subscribers re-render
  listeners.forEach((l) => l());
}

/** Can the current profile see this title? Unknown ratings count as adult. */
export function isAllowed(title) {
  return (RATING_LEVEL[title?.contentRating] ?? LEVELS.all) <= maxLevel;
}

/** The titles the current profile may see. */
export function getCatalog() {
  return maxLevel === LEVELS.all ? current.titles : current.titles.filter(isAllowed);
}

/** 'local' (bundled) or 'supabase'. Changes when the remote catalog arrives. */
export function getCatalogSource() {
  return current.source;
}

export function subscribeCatalog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** A value that changes whenever the catalog is replaced (for useSyncExternalStore). */
export function getCatalogSnapshot() {
  return current;
}

/**
 * Swap in a catalog loaded from Supabase. Records use the same shape as the
 * bundled ones. Returns the validation problems; if there are any, the current
 * catalog is kept.
 */
export function replaceCatalog(records, { featuredId, source }) {
  const titles = Object.freeze(records.map(makeTitle));
  const problems = validateCatalog(titles, featuredId);
  if (problems.length) return problems;
  current = { titles, featuredId, source };
  byId = new Map(titles.map((t) => [t.id, t]));
  listeners.forEach((l) => l());
  return [];
}

export function getTitleById(id) {
  return byId.get(id) ?? null;
}

/** The featured title, or the first title this profile may see if it's restricted. */
export function getFeaturedTitle() {
  const featured = getTitleById(current.featuredId);
  return featured && isAllowed(featured) ? featured : (getCatalog()[0] ?? null);
}

export function getTitlesByType(type) {
  return getCatalog().filter((t) => t.type === type);
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

const peopleOf = (t) => [...(t.credits ?? []).flatMap((c) => c.names), ...(t.cast ?? [])];

/**
 * Trimmed, case-insensitive, partial match on title, cast, crew and genre.
 * Title matches come first (starts-with before contains), then people, then
 * genres. Empty query → no results.
 */
export function searchCatalog(query) {
  const q = normalizeForSearch(query);
  if (!q) return [];
  const score = (t) => {
    const name = normalizeForSearch(t.title);
    if (name.startsWith(q)) return 4;
    if (name.includes(q)) return 3;
    if (peopleOf(t).some((p) => normalizeForSearch(p).includes(q))) return 2;
    if (t.genres.some((g) => normalizeForSearch(g).includes(q))) return 1;
    return 0;
  };
  return getCatalog()
    .map((t) => [t, score(t)])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}

/** People and genres matching the query, for "Explore titles related to:". */
export function searchRelated(query, limit = 6) {
  const q = normalizeForSearch(query);
  if (!q) return [];
  const names = new Set();
  for (const t of getCatalog()) {
    for (const p of peopleOf(t)) if (normalizeForSearch(p).includes(q)) names.add(p);
    for (const g of t.genres) if (normalizeForSearch(g).includes(q)) names.add(g);
  }
  return [...names].slice(0, limit);
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

/** A series' stored episode, or its first one when none (or an unknown one) is asked for. */
export function getEpisode(title, season, episode) {
  if (title.type !== 'series') return null;
  const list = title.episodes ?? [];
  return (
    list.find((e) => e.season === Number(season) && e.episode === Number(episode)) ??
    title.firstEpisode ??
    list[0] ??
    null
  );
}

/** The episode after `ep` that we have stored (same season, else the next season's first). */
export function getNextEpisode(title, ep) {
  if (!ep || title.type !== 'series') return null;
  const list = [...(title.episodes ?? [])].sort((a, b) => a.season - b.season || a.episode - b.episode);
  return list.find((e) => e.season > ep.season || (e.season === ep.season && e.episode > ep.episode)) ?? null;
}

/** What the mock player plays: the film itself, or a series episode (the first by default). */
export function getPlayable(title, ep = getEpisode(title)) {
  if (title.type === 'series' && ep) {
    return {
      label: `S${ep.season}:E${ep.episode}`,
      subtitle: `“${ep.title}”`,
      durationSeconds: ep.runtimeMinutes * 60,
      episode: ep,
    };
  }
  return { label: null, subtitle: null, durationSeconds: (title.runtimeMinutes ?? 0) * 60, episode: null };
}

// ───────────── Dev-time data validation ─────────────

const REQUIRED = ['id', 'title', 'type', 'synopsis', 'releaseYear', 'contentRating'];

export function validateCatalog(items = LOCAL_CATALOG, featuredId = FEATURED_TITLE_ID) {
  const problems = [];
  const ids = new Set();
  for (const t of items) {
    for (const key of REQUIRED) {
      if (t[key] === undefined || t[key] === null || t[key] === '') problems.push(`${t.id}: missing ${key}`);
    }
    if (ids.has(t.id)) problems.push(`duplicate id ${t.id}`);
    ids.add(t.id);
    if (!TYPES[t.type]) problems.push(`${t.id}: unknown type ${t.type}`);
    if (t.type === 'series' && !(t.seasons && t.episodeCount))
      problems.push(`${t.id}: series needs seasons/episodeCount`);
    if (t.type !== 'series' && !t.runtimeMinutes) problems.push(`${t.id}: needs runtimeMinutes`);
  }
  for (const type of Object.keys(TYPES)) {
    const count = items.filter((t) => t.type === type).length;
    if (count < 4) problems.push(`expected at least 4 ${type} titles, found ${count}`);
  }
  if (!items.some((t) => t.id === featuredId)) problems.push('featured title is not in the catalog');
  return problems;
}

if (import.meta.env?.DEV) {
  const problems = validateCatalog();
  if (problems.length) console.warn('[catalog] data problems:', problems);
}
