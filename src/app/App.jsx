import { useRef } from 'react';
import { matchPath, Route, Routes, useLocation } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import Footer from '../components/Footer.jsx';
import RouteEffects from './RouteEffects.jsx';
import HomePage from '../pages/HomePage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import TitleDetailsPage from '../pages/TitleDetailsPage.jsx';
import MyListPage from '../pages/MyListPage.jsx';
import PlayerPage from '../pages/PlayerPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { getTitleById } from '../data/catalog.js';

export default function App() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  // The player is immersive: no header/footer, just its own Back control.
  const watchMatch = matchPath('/watch/:titleId', pathname);
  const immersive = Boolean(watchMatch && getTitleById(watchMatch.params.titleId));

  return (
    <div className={`app${immersive ? ' app--immersive' : ''}`}>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      {!immersive && <AppHeader />}
      <RouteEffects mainRef={mainRef} />

      <main id="main" ref={mainRef} tabIndex={-1} className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/titles/:titleId" element={<TitleDetailsPage />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/watch/:titleId" element={<PlayerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!immersive && <Footer />}
    </div>
  );
}
