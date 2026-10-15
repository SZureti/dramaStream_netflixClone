import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/catalog.js';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <nav aria-label="Footer">
          <ul className="app-footer__links">
            <li>
              <Link to="/">Home</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.anchor}>
                <Link to={{ pathname: '/', hash: `#${c.anchor}` }}>{c.title}</Link>
              </li>
            ))}
            <li>
              <Link to="/search">Search</Link>
            </li>
            <li>
              <Link to="/my-list">My List</Link>
            </li>
            <li>
              <Link to="/help">Help</Link>
            </li>
          </ul>
        </nav>
        <p className="app-footer__note">
          DramaStream is an educational, Netflix-inspired prototype built for the Code Platoon Netflix Clone
          assignment. It is not affiliated with Netflix, streams no films or episodes, and collects no personal
          information.
        </p>
        <p className="app-footer__note">
          Posters, backgrounds, and title logos are from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            TMDB<span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          and belong to their respective studios and distributors. This product is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </footer>
  );
}
