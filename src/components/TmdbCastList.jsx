import { Link } from 'react-router-dom';
import SmartImage from './SmartImage.jsx';

/** Cast photos, names and characters; each actor links to their TMDB profile page. */
export default function TmdbCastList({ cast, from }) {
  return (
    <ul className="tmdb-cast__list">
      {cast.map((c) => (
        <li key={`${c.id}-${c.character}`}>
          <Link to={`/person/${c.id}`} state={{ from }} className="tmdb-cast__link">
            <div className="tmdb-cast__photo">
              <SmartImage src={c.photo} alt="" fallbackText={c.name} width="185" height="278" loading="lazy" />
            </div>
            <p className="tmdb-cast__name">{c.name}</p>
          </Link>
          {c.character && <p className="tmdb-cast__role">{c.character}</p>}
        </li>
      ))}
    </ul>
  );
}
