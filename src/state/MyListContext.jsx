import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { useStatus } from './StatusContext.jsx';

const MyListContext = createContext(null);

/**
 * My List stores title IDs only (never copies of title objects), in memory.
 * It intentionally resets on a full page refresh.
 */
export function MyListProvider({ children }) {
  const [savedIds, setSavedIds] = useState([]);
  const { announce } = useStatus();

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const add = useCallback(
    (id) => {
      const title = getTitleById(id);
      if (!title) return;
      // Newest first; a repeated add is a no-op, so duplicates can't happen.
      setSavedIds((ids) => (ids.includes(id) ? ids : [id, ...ids]));
      announce(`Added “${title.title}” to My List`);
    },
    [announce],
  );

  const remove = useCallback(
    (id) => {
      const title = getTitleById(id);
      setSavedIds((ids) => ids.filter((x) => x !== id));
      if (title) announce(`Removed “${title.title}” from My List`);
    },
    [announce],
  );

  const toggle = useCallback((id) => (savedIds.includes(id) ? remove(id) : add(id)), [savedIds, add, remove]);

  const value = useMemo(() => ({ savedIds, isSaved, add, remove, toggle }), [savedIds, isSaved, add, remove, toggle]);

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) throw new Error('useMyList must be used inside <MyListProvider>');
  return ctx;
}
