import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import SmartImage from '../components/SmartImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TmdbCard from '../components/TmdbCard.jsx';
import { ArrowLeftIcon, SearchIcon } from '../components/Icons.jsx';
import { formatDate, getTmdbPerson, tmdbAllowedForProfile, tmdbAvailable } from '../data/tmdb.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/** An actor's profile and best-known films and series, from TMDB. */
export default function TmdbPersonPage() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const validId = /^\d{1,9}$/.test(personId);
  const allowed = tmdbAvailable && tmdbAllowedForProfile();
  const [state, setState] = useState({ id: '', status: 'loading', person: null });

  useEffect(() => {
    if (!validId || !allowed) return undefined;
    let cancelled = false;
    getTmdbPerson(personId)
      .then((person) => !cancelled && setState({ id: personId, status: 'done', person }))
      .catch(() => !cancelled && setState({ id: personId, status: 'error', person: null }));
    return () => {
      cancelled = true;
    };
  }, [personId, validId, allowed]);

  const current = state.id === personId ? state : { status: 'loading', person: null };
  const person = current.person;
  useDocumentTitle(person?.name ?? 'Actor');

  const goBack = () => (from && location.key !== 'default' ? navigate(-1) : navigate('/search'));

  if (!validId || !allowed || current.status === 'error') {
    return (
      <div className="page">
        <EmptyState
          icon={<SearchIcon size={44} />}
          heading="Couldn't load this person"
          actions={
            <Link to="/search" className="btn btn--primary">
              Back to Search
            </Link>
          }
        >
          <p>We couldn&apos;t get this profile from TMDB. Try again in a moment.</p>
        </EmptyState>
      </div>
    );
  }

  if (current.status === 'loading') {
    return (
      <div className="page">
        <p role="status">Loading profile…</p>
      </div>
    );
  }

  const facts = [
    { term: 'Profession', detail: person.knownFor },
    { term: 'Born', detail: [formatDate(person.birthday), person.birthplace].filter(Boolean).join(' · ') },
    { term: 'Died', detail: formatDate(person.deathday) },
  ].filter((f) => f.detail);

  return (
    <div className="page">
      <p>
        <button type="button" className="back-btn" onClick={goBack}>
          <ArrowLeftIcon size={22} />
          <span>Back</span>
        </button>
      </p>
      <article className="tmdb-details" aria-labelledby="person-name">
        <div className="tmdb-details__poster">
          <SmartImage src={person.photo} alt="" fallbackText={person.name} width="342" height="513" />
        </div>
        <div>
          <h1 id="person-name" className="page__title">
            {person.name}
          </h1>
          <dl className="tmdb-details__facts">
            {facts.map((f) => (
              <div key={f.term} style={{ display: 'contents' }}>
                <dt>{f.term}</dt>
                <dd>{f.detail}</dd>
              </div>
            ))}
          </dl>
          <p>{person.biography || 'No biography is available for this person yet.'}</p>
        </div>

        {person.credits.length > 0 && (
          <section className="tmdb-person__credits" aria-labelledby="credits-heading">
            <h2 id="credits-heading" className="section-title">
              Known for
            </h2>
            <ul className="card-grid">
              {person.credits.map((c) => (
                <li key={`${c.type}-${c.id}`}>
                  <TmdbCard hit={c} />
                  {c.character && <p className="tmdb-cast__role">as {c.character}</p>}
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
