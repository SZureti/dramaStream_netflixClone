import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TmdbCastList from './TmdbCastList.jsx';
import { getTmdbDetails, tmdbAllowedForProfile, tmdbAvailable } from '../data/tmdb.js';
import { tmdbRefFor } from '../data/tmdbIds.js';

/**
 * "Full cast" for a DramaStream title: photos and characters from TMDB, each
 * actor linking to their profile. It only adds to the plain cast names already
 * shown, so it renders nothing while loading, if TMDB fails, or on Kids profiles.
 */
export default function CatalogCast({ title, headingLevel = 2 }) {
  const location = useLocation();
  const ref = tmdbRefFor(title.id);
  const allowed = Boolean(ref) && tmdbAvailable && tmdbAllowedForProfile();
  const [state, setState] = useState({ titleId: '', cast: [] });

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;
    getTmdbDetails(ref.type, ref.id)
      .then((details) => !cancelled && setState({ titleId: title.id, cast: details.cast }))
      .catch(() => !cancelled && setState({ titleId: title.id, cast: [] }));
    return () => {
      cancelled = true;
    };
  }, [allowed, ref?.type, ref?.id, title.id]);

  const cast = state.titleId === title.id ? state.cast : [];
  if (!allowed || cast.length === 0) return null;

  const Heading = `h${headingLevel}`;
  return (
    <section className="catalog-cast" aria-labelledby={`full-cast-${title.id}`}>
      <Heading id={`full-cast-${title.id}`} className="section-title">
        Full cast
      </Heading>
      <TmdbCastList cast={cast} from={location.pathname} />
      <p className="tmdb-credit">Cast from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </section>
  );
}
