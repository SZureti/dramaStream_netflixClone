import { supabase } from '../lib/supabase.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (date) => date.toISOString().slice(0, 10);

/**
 * Plays and My List adds per title from the anonymous title_activity table:
 * `today` counts the last two days, `week` the last seven. Resolves to an
 * empty Map when Supabase isn't available, so rows fall back to editors' picks.
 */
export async function fetchActivity() {
  if (!supabase) return new Map();
  const since = isoDay(new Date(Date.now() - 7 * DAY_MS));
  const recent = isoDay(new Date(Date.now() - DAY_MS));
  const { data, error } = await supabase.from('title_activity').select('title_id, day, plays, adds').gte('day', since);
  if (error) return new Map();
  const scores = new Map();
  for (const row of data) {
    const s = scores.get(row.title_id) ?? { today: 0, week: 0 };
    const points = row.plays * 2 + row.adds; // a play says more than an add
    s.week += points;
    if (row.day >= recent) s.today += points;
    scores.set(row.title_id, s);
  }
  return scores;
}
