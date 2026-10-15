import { describe, expect, it } from 'vitest';
import { toRecord } from '../data/remoteCatalog.js';

const seriesRow = {
  id: 'normal-people',
  title: 'Normal People',
  type: 'series',
  synopsis: 'Connell and Marianne…',
  release_year: 2020,
  content_rating: 'TV-MA',
  runtime_minutes: null,
  seasons: 1,
  episode_count: 12,
  limited_series: true,
  cast_label: null,
  hero_position: '62% 40%',
  is_featured: false,
  sort_order: 3,
  title_genres: [
    { position: 1, genres: { name: 'Romance' } },
    { position: 0, genres: { name: 'Drama' } },
  ],
  credits: [
    { role: 'Cast', role_position: 2, position: 1, people: { name: 'Paul Mescal' } },
    { role: 'Directed by', role_position: 0, position: 1, people: { name: 'Hettie Macdonald' } },
    { role: 'Cast', role_position: 2, position: 0, people: { name: 'Daisy Edgar-Jones' } },
    { role: 'Directed by', role_position: 0, position: 0, people: { name: 'Lenny Abrahamson' } },
    { role: 'Based on the novel by', role_position: 1, position: 0, people: { name: 'Sally Rooney' } },
  ],
  season_rows: [{ season_number: 1, episodes: [{ episode_number: 1, name: 'Episode 1', runtime_minutes: 29 }] }],
};

describe('toRecord: a Supabase row becomes a catalog record', () => {
  const record = toRecord(seriesRow);

  it('orders genres and credits by their position columns', () => {
    expect(record.genres).toEqual(['Drama', 'Romance']);
    expect(record.credits).toEqual([
      { role: 'Directed by', names: ['Lenny Abrahamson', 'Hettie Macdonald'] },
      { role: 'Based on the novel by', names: ['Sally Rooney'] },
    ]);
    expect(record.cast).toEqual(['Daisy Edgar-Jones', 'Paul Mescal']);
  });

  it('keeps series fields and finds the first episode', () => {
    expect(record).toMatchObject({ seasons: 1, episodeCount: 12, limitedSeries: true });
    expect(record.firstEpisode).toEqual({ season: 1, episode: 1, title: 'Episode 1', runtimeMinutes: 29 });
    expect(record.runtimeMinutes).toBeUndefined();
  });
});
