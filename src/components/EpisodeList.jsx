import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from './SmartImage.jsx';
import { PlayIcon } from './Icons.jsx';
import { formatRuntime } from '../data/catalog.js';
import { useProgress } from '../state/ProgressContext.jsx';

/** Episodes for a series, one season at a time, each with its own Play link. */
export default function EpisodeList({ title, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  const selectId = useId();
  const saved = useProgress().getProgress(title.id);
  const [season, setSeason] = useState(saved?.season ?? 1);
  const seasons = Array.from({ length: title.seasons ?? 1 }, (_, i) => i + 1);
  const episodes = (title.episodes ?? []).filter((e) => e.season === season);
  const storedSeasons = new Set((title.episodes ?? []).map((e) => e.season));

  return (
    <section className="episodes" aria-labelledby={`${selectId}-heading`}>
      <div className="episodes__head">
        <Heading id={`${selectId}-heading`} className="section-title episodes__title">
          Episodes
        </Heading>
        {seasons.length > 1 && (
          <>
            <label htmlFor={selectId} className="sr-only">
              Season
            </label>
            <select
              id={selectId}
              className="field episodes__season"
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  Season {s}
                  {storedSeasons.has(s) ? '' : ' (details coming soon)'}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {episodes.length === 0 ? (
        <p className="episodes__none">Episode details for Season {season} aren’t in the catalog yet.</p>
      ) : (
        <ol className="episodes__list">
          {episodes.map((ep) => {
            const watching = saved && saved.season === ep.season && saved.episode === ep.episode;
            return (
              <li key={`${ep.season}-${ep.episode}`} className={`episode${watching ? ' episode--current' : ''}`}>
                <span className="episode__number" aria-hidden="true">
                  {ep.episode}
                </span>
                <Link
                  to={`/watch/${title.id}?s=${ep.season}&e=${ep.episode}`}
                  className="episode__thumb"
                  aria-label={`Play episode ${ep.episode}: ${ep.title}`}
                >
                  <SmartImage
                    src={ep.still ?? title.heroSmallSrc}
                    loading="lazy"
                    alt=""
                    fallbackText={ep.title}
                    style={ep.still ? undefined : { objectPosition: title.heroPosition }}
                  />
                  <span className="episode__play" aria-hidden="true">
                    <PlayIcon size={22} />
                  </span>
                  {watching && (
                    <span className="card__progress" aria-hidden="true">
                      <span
                        className="card__progress-fill"
                        style={{ width: `${Math.round((saved.position / saved.duration) * 100)}%`, display: 'block' }}
                      />
                    </span>
                  )}
                </Link>
                <div className="episode__body">
                  <p className="episode__title">
                    <span className="sr-only">Episode {ep.episode}: </span>
                    {ep.title}
                    <span className="episode__runtime">{formatRuntime(ep.runtimeMinutes)}</span>
                  </p>
                  {ep.synopsis && <p className="episode__synopsis">{ep.synopsis}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
