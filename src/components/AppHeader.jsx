import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useMyList } from '../state/MyListContext.jsx';
import { CATEGORIES } from '../data/catalog.js';
import { HomeIcon, ListIcon, SearchIcon } from './Icons.jsx';

const CATEGORY_LINKS = CATEGORIES.map((c) => ({
  hash: `#${c.anchor}`,
  label: c.title.replace('Drama ', ''),
}));

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => setScrolled(window.scrollY > threshold);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);
  return scrolled;
}

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="count-badge">
      {count}
      <span className="sr-only"> saved</span>
    </span>
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="DramaStream home">
      Drama<span>Stream</span>
    </Link>
  );
}

export default function AppHeader() {
  const scrolled = useScrolled();
  const { savedIds } = useMyList();
  const { pathname, hash } = useLocation();
  const onHome = pathname === '/';

  return (
    <>
      <header className={`app-header${scrolled ? ' app-header--solid' : ''}`}>
        <div className="app-header__inner">
          <Wordmark />

          <nav className="primary-nav" aria-label="Primary">
            <ul>
              <li>
                <Link to="/" className="nav-link" aria-current={onHome && !hash ? 'page' : undefined}>
                  Home
                </Link>
              </li>
              {CATEGORY_LINKS.map((c) => (
                <li key={c.hash} className="primary-nav__category">
                  <Link
                    to={{ pathname: '/', hash: c.hash }}
                    className="nav-link"
                    aria-current={onHome && hash === c.hash ? 'location' : undefined}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <NavLink to="/my-list" className="nav-link">
                  My List
                  <CountBadge count={savedIds.length} />
                </NavLink>
              </li>
            </ul>
          </nav>

          <NavLink to="/search" className="header-search" aria-label="Search">
            <SearchIcon size={22} />
            <span className="header-search__label">Search</span>
          </NavLink>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Primary (mobile)">
        <ul>
          <li>
            <NavLink to="/" end className="tab-bar__link">
              <HomeIcon size={22} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className="tab-bar__link">
              <SearchIcon size={22} />
              <span>Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-list" className="tab-bar__link">
              <ListIcon size={22} />
              <span>My List</span>
              <CountBadge count={savedIds.length} />
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
