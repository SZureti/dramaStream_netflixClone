import { lazy, Suspense, useRef } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import Footer from '../components/Footer.jsx';
import RouteEffects from './RouteEffects.jsx';
import HomePage from '../pages/HomePage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import TitleDetailsPage from '../pages/TitleDetailsPage.jsx';
import MyListPage from '../pages/MyListPage.jsx';
const PlayerPage = lazy(() => import('../pages/PlayerPage.jsx'));
import NotFoundPage from '../pages/NotFoundPage.jsx';
const LandingPage = lazy(() => import('../pages/LandingPage.jsx'));
const SignInPage = lazy(() => import('../pages/SignInPage.jsx'));
const SignUpPage = lazy(() => import('../pages/SignUpPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx'));
const AccountPage = lazy(() => import('../pages/AccountPage.jsx'));
const HelpPage = lazy(() => import('../pages/HelpPage.jsx'));
const BrowsePage = lazy(() => import('../pages/BrowsePage.jsx'));
const NewPopularPage = lazy(() => import('../pages/NewPopularPage.jsx'));
const ActivityPage = lazy(() => import('../pages/ActivityPage.jsx'));
const TmdbDetailsPage = lazy(() => import('../pages/TmdbDetailsPage.jsx'));
const TmdbPersonPage = lazy(() => import('../pages/TmdbPersonPage.jsx'));
import RequireAuth from '../components/RequireAuth.jsx';
const ProfilesPage = lazy(() => import('../pages/ProfilesPage.jsx'));
const ProfileEditPage = lazy(() => import('../pages/ProfileEditPage.jsx'));
import { useProfiles } from '../state/ProfileContext.jsx';
import TitleModal from '../components/TitleModal.jsx';
import { isAllowed } from '../data/catalog.js';
import { useAuth } from '../state/AuthContext.jsx';
import { hasChosenGuest } from '../lib/guest.js';
import { getTitleById } from '../data/catalog.js';
import useCatalog from '../data/useCatalog.js';

// Screens with their own minimal header (welcome page and the account forms).
const BARE_PATHS = ['/welcome', '/signin', '/signup', '/forgot-password', '/reset-password'];
const isBare = (path) => BARE_PATHS.includes(path) || path === '/profiles' || path.startsWith('/profiles/');

/** Signed-out first-time visitors see the welcome page; anyone who chose to browse gets Home. */
function HomeGate() {
  const { available, ready, user } = useAuth();
  if (available && ready && !user && !hasChosenGuest()) return <Navigate to="/welcome" replace />;
  return <HomePage />;
}

/** /titles/:id opened from inside the app: the details modal over the page underneath. */
function TitleModalRoute() {
  const { titleId } = useParams();
  const title = getTitleById(titleId);
  if (!title || !isAllowed(title)) return <Navigate to={`/titles/${titleId}`} replace />;
  return <TitleModal key="modal" title={title} />;
}

export default function App() {
  // Re-render the whole app when the Supabase catalog replaces the bundled one.
  useCatalog();
  const mainRef = useRef(null);
  const location = useLocation();
  const { pathname } = location;
  // Opened from a card or More Info: render the page underneath, details on top.
  const background = location.state?.backgroundLocation;

  // The player is immersive: no header/footer, just its own Back control.
  const watchMatch = matchPath('/watch/:titleId', pathname);
  const immersive = Boolean(watchMatch && getTitleById(watchMatch.params.titleId));
  const bare = isBare(pathname);
  // Signed in with several profiles but none chosen yet: ask "Who's watching?" first.
  const { needsChoice, loaded: profilesLoaded } = useProfiles();
  const { available: authAvailable, ready: authReady } = useAuth();
  // Until we know who is signed in and which profile they chose, don't render pages: a Kids
  // profile would otherwise be treated as unrestricted for a moment (flashing adult titles).
  const identityPending = authAvailable && (!authReady || !profilesLoaded);
  const askWhoIsWatching = needsChoice && !bare && pathname !== '/account';

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
      {!immersive && !bare && <AppHeader />}
      <RouteEffects mainRef={mainRef} />

      <main id="main" ref={mainRef} tabIndex={-1} className="app-main">
        {identityPending ? (
          <p className="page route-loading" role="status">
            Loading…
          </p>
        ) : askWhoIsWatching ? (
          <Navigate to="/profiles" replace />
        ) : (
          <Suspense
            fallback={
              <p className="page route-loading" role="status">
                Loading…
              </p>
            }
          >
            <Routes location={background ?? location}>
              <Route path="/" element={<HomeGate />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/titles/:titleId" element={<TitleDetailsPage />} />
              <Route path="/tmdb/:type/:tmdbId" element={<TmdbDetailsPage />} />
              <Route path="/person/:personId" element={<TmdbPersonPage />} />
              <Route path="/my-list" element={<MyListPage />} />
              <Route path="/watch/:titleId" element={<PlayerPage />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/browse/:kind" element={<BrowsePage />} />
              <Route path="/new" element={<NewPopularPage />} />
              <Route
                path="/account/activity"
                element={
                  <RequireAuth>
                    <ActivityPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/account"
                element={
                  <RequireAuth>
                    <AccountPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/profiles"
                element={
                  <RequireAuth>
                    <ProfilesPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/profiles/new"
                element={
                  <RequireAuth>
                    <ProfileEditPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/profiles/:profileId/edit"
                element={
                  <RequireAuth>
                    <ProfileEditPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        )}
        {background && !identityPending && !askWhoIsWatching && (
          <Routes>
            <Route path="/titles/:titleId" element={<TitleModalRoute />} />
          </Routes>
        )}
      </main>

      {!immersive && <Footer />}
    </div>
  );
}
