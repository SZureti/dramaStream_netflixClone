import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SmartImage from '../components/SmartImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons.jsx';
import { formatMinutes, getTmdbDetails, tmdbAllowedForProfile, tmdbAvailable } from '../data/tmdb.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const KINDS = { movie: 'Film', tv: 'Series' };

/** Overview, genres and cast for a title found through TMDB (not in our catalog). */
export default function TmdbDetailsPage() {
  const { type, tmdbId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const validType = type in KINDS;
  const [state, setState] = useState({ key: '', status: 'loading', details: null });
  const key = `${type}/${tmdbId}`;
  const allowed = tmdbAvailable && tmdbAllowedForProfile();

  useEffect(() => {
    if (!validType || !allowed) return undefined;
    let cancelled = false;
    getTmdbDetails(type, tmdbId)
      .then((details) => !cancelled && setState({ key, status: 'done', details }))
      .catch(() => !cancelled && setState({ key, status: 'error', details: null }));
    return () => {
      cancelled = true;
    };
  }, [type, tmdbId, validType, allowed, key]);

  const current = state.key === key ? state : { status: 'loading', details: null };
  const details = current.details;
  useDocumentTitle(details?.title ?? 'TMDB title');

  const goBack = () => (from && location.key !== 'default' ? navigate(-1) : navigate('/search'));
  const backButton = (
    <button type="button" className="back-btn" onClick={goBack}>
      <ArrowLeftIcon size={22} />
      <span>{from?.startsWith('/search') ? 'Back to Search' : 'Back'}</span>
    </button>
  );

  if (!validType || !allowed || current.status === 'error') {
    return (
      <div className="page">
        <EmptyState
          icon={<SearchIcon size={44} />}
          heading="Couldn't load this title"
          actions={
            <Link to="/search" className="btn btn--primary">
              Back to Search
            </Link>
          }
        >
          <p>We couldn&apos;t get details for this title from TMDB. Try again in a moment.</p>
        </EmptyState>
      </div>
    );
  }

  if (current.status === 'loading') {
    return (
      <div className="page">
        <p role="status">Loading details…</p>
      </div>
    );
  }

  const facts = [
    { term: 'Type', detail: KINDS[details.type] },
    { term: 'Released', detail: details.year },
    { term: 'Genres', detail: details.genres.join(', ') },
    details.type === 'tv'
      ? {
          term: 'Seasons',
          detail: [
            details.seasons && `${details.seasons} ${details.seasons === 1 ? 'season' : 'seasons'}`,
            details.episodes && `${details.episodes} episodes`,
          ]
            .filter(Boolean)
            .join(' · '),
        }
      : { term: 'Runtime', detail: formatMinutes(details.runtime) },
    { term: details.type === 'tv' ? 'Created by' : 'Directed by', detail: details.directors.join(', ') },
    { term: 'TMDB rating', detail: details.rating ? `${details.rating} / 10` : '' },
    { term: 'Status', detail: details.status },
  ].filter((f) => f.detail);

  return (
    <div className="page">
      <p>{backButton}</p>
      <article className="tmdb-details" aria-labelledby="tmdb-title">
        <div className="tmdb-details__poster">
          <SmartImage src={details.poster} alt="" fallbackText={details.title} width="500" height="750" />
        </div>
        <div>
          <h1 id="tmdb-title" className="page__title">
            {details.title}
          </h1>
          {details.tagline && <p className="tmdb-details__tagline">{details.tagline}</p>}
          <p>{details.overview || 'No overview is available for this title yet.'}</p>
          <dl className="tmdb-details__facts">
            {facts.map((f) => (
              <div key={f.term} style={{ display: 'contents' }}>
                <dt>{f.term}</dt>
                <dd>{f.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        {details.cast.length > 0 && (
          <section className="tmdb-cast" aria-labelledby="tmdb-cast-heading">
            <h2 id="tmdb-cast-heading" className="section-title">
              Cast
            </h2>
            <ul className="tmdb-cast__list">
              {details.cast.map((c) => (
                <li key={`${c.name}-${c.character}`}>
                  <div className="tmdb-cast__photo">
                    <SmartImage src={c.photo} alt="" fallbackText={c.name} width="185" height="278" loading="lazy" />
                  </div>
                  <p className="tmdb-cast__name">{c.name}</p>
                  {c.character && <p className="tmdb-cast__role">{c.character}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="tmdb-credit">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </article>
    </div>
  );
}
