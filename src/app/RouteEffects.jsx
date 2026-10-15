import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const positions = new Map();

/**
 * Scroll + focus management for a BrowserRouter SPA:
 * - Back/Forward  → restore the previous scroll position (browsing context)
 * - new navigation → top of page (or the #category row), focus moves to <main>
 * - query-only replacements (typing in Search) → leave scroll and focus alone
 */
export default function RouteEffects({ mainRef }) {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(location.key);
  const prevRef = useRef(null);

  // Continuously remember the scroll position of the current history entry.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => positions.set(keyRef.current, window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = location.key;
    const prev = prevRef.current;
    prevRef.current = location;
    const isFirst = prev === null;

    // Opening or closing a details modal: the page underneath stays exactly where it was.
    const modalChange = location.state?.backgroundLocation || (navType === 'POP' && prev?.state?.backgroundLocation);
    if (modalChange && !isFirst) return;

    // Typing in Search rewrites ?q= on the same page — not a navigation.
    const queryOnly =
      navType === 'REPLACE' && prev && prev.pathname === location.pathname && prev.search !== location.search;
    if (queryOnly) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const restoring = navType === 'POP' && positions.has(location.key);

    if (restoring) {
      const y = positions.get(location.key);
      window.scrollTo(0, y);
      // Once more after paint, in case layout settled late.
      requestAnimationFrame(() => window.scrollTo(0, y));
    } else {
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: isFirst || reduce ? 'auto' : 'smooth', block: 'start' });
        return; // keep focus where it is; the row is now in view
      }
      window.scrollTo(0, 0);
    }

    // Move focus to the new content for keyboard/screen-reader users, unless
    // the page already placed focus inside it (e.g. the Search field).
    if (!isFirst) {
      const main = mainRef.current;
      if (main && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
    }
  }, [location, navType, mainRef]);

  return null;
}
