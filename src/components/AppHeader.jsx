import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useMyList } from '../state/MyListContext.jsx';
import { HomeIcon, ListIcon, SearchIcon } from './Icons.jsx';
import AccountMenu from './AccountMenu.jsx';
import NotificationsBell from './NotificationsBell.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';

// Netflix-style browse pages (see pages/BrowsePage.jsx).
const BROWSE_LINKS = [
  { to: '/browse/series', label: 'TV Shows' },
  { to: '/browse/films', label: 'Movies' },
  { to: '/browse/documentaries', label: 'Documentaries' },
  { to: '/new', label: 'New & Popular' },
];

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
  // Kids profiles get Netflix's simpler header: no category shortcuts, a Kids badge.
  const kids = Boolean(useProfiles().current?.is_kids);

  return (
    <>
      <header className={`app-header${scrolled ? ' app-header--solid' : ''}`}>
        <div className="app-header__inner">
          <Wordmark />
          {kids && <span className="kids-badge">Kids</span>}

          <nav className="primary-nav" aria-label="Primary">
            <ul>
              <li>
                <Link to="/" className="nav-link" aria-current={onHome && !hash ? 'page' : undefined}>
                  Home
                </Link>
              </li>
              {!kids &&
                BROWSE_LINKS.map((c) => (
                  <li key={c.to} className="primary-nav__category">
                    <NavLink to={c.to} className="nav-link">
                      {c.label}
                    </NavLink>
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
          <NotificationsBell />
          <AccountMenu />
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
