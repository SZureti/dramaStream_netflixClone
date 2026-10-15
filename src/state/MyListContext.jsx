import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { supabase } from '../lib/supabase.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';
import { useProfiles } from './ProfileContext.jsx';
import { useStatus } from './StatusContext.jsx';

const MyListContext = createContext(null);
const GUEST_KEY = 'dramastream:mylist:v1';

const readGuestList = () => {
  const ids = readJSON(GUEST_KEY, []);
  return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
};

/**
 * My List stores title IDs only (never copies of title objects), newest first.
 * Signed out, it lives in this browser (localStorage). Signed in, it belongs
 * to the chosen profile in Supabase (table my_list), so it follows the viewer
 * to any device. A guest list is merged into the first profile chosen.
 */
export function MyListProvider({ children }) {
  const { current } = useProfiles();
  const { announce } = useStatus();
  const [savedIds, setSavedIds] = useState(readGuestList);
  const [syncing, setSyncing] = useState(false);
  const profileId = current?.id ?? null;
  const profileRef = useRef(profileId);
  profileRef.current = profileId;

  // Load the right list whenever the viewer signs in or out.
  useEffect(() => {
    if (!profileId || !supabase) {
      setSavedIds(readGuestList());
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setSyncing(true);
      const guest = readGuestList();
      const { data, error } = await supabase
        .from('my_list')
        .select('title_id, added_at')
        .eq('profile_id', profileId)
        .order('added_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setSyncing(false);
        announce('Couldn’t load My List from your account.');
        return;
      }
      const account = data.map((r) => r.title_id);
      const toMerge = guest.filter((id) => !account.includes(id) && getTitleById(id));
      if (toMerge.length) {
        const { error: mergeError } = await supabase.from('my_list').upsert(
          toMerge.map((title_id) => ({ profile_id: profileId, title_id })),
          { onConflict: 'profile_id,title_id', ignoreDuplicates: true },
        );
        if (!mergeError) {
          removeKey(GUEST_KEY);
          announce(
            `Added ${toMerge.length} saved ${toMerge.length === 1 ? 'title' : 'titles'} to ${current.name}’s list`,
          );
        }
      } else {
        removeKey(GUEST_KEY);
      }
      if (cancelled) return;
      setSavedIds([...toMerge, ...account]);
      setSyncing(false);
    })();
    return () => {
      cancelled = true;
    };
    // current.name is only used in a message; the profile id decides when to reload.
  }, [profileId, announce]);

  // Guests: keep the browser copy in step.
  useEffect(() => {
    if (!profileId) writeJSON(GUEST_KEY, savedIds);
  }, [savedIds, profileId]);

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  // Update the screen first, then the account; undo if the account write fails.
  const persist = useCallback(
    async (write, undo, failMessage) => {
      if (!profileRef.current || !supabase) return;
      const { error } = await write();
      if (error) {
        undo();
        announce(failMessage);
      }
    },
    [announce],
  );

  const add = useCallback(
    (id) => {
      const title = getTitleById(id);
      if (!title) return;
      // Newest first; a repeated add is a no-op, so duplicates can't happen.
      setSavedIds((ids) => (ids.includes(id) ? ids : [id, ...ids]));
      announce(`Added “${title.title}” to My List`);
      persist(
        () =>
          supabase
            .from('my_list')
            .upsert(
              { profile_id: profileRef.current, title_id: id },
              { onConflict: 'profile_id,title_id', ignoreDuplicates: true },
            ),
        () => setSavedIds((ids) => ids.filter((x) => x !== id)),
        `Couldn’t save “${title.title}” to My List. Try again.`,
      );
    },
    [announce, persist],
  );

  const remove = useCallback(
    (id) => {
      const title = getTitleById(id);
      let position = -1;
      setSavedIds((ids) => {
        position = ids.indexOf(id);
        return ids.filter((x) => x !== id);
      });
      if (title) announce(`Removed “${title.title}” from My List`);
      persist(
        () => supabase.from('my_list').delete().eq('profile_id', profileRef.current).eq('title_id', id),
        () =>
          setSavedIds((ids) => {
            if (ids.includes(id)) return ids;
            const next = [...ids];
            next.splice(Math.max(0, position), 0, id);
            return next;
          }),
        `Couldn’t remove “${title?.title ?? 'that title'}” from My List. Try again.`,
      );
    },
    [announce, persist],
  );

  const toggle = useCallback((id) => (savedIds.includes(id) ? remove(id) : add(id)), [savedIds, add, remove]);

  const value = useMemo(
    () => ({ savedIds, isSaved, add, remove, toggle, syncing, inAccount: Boolean(profileId) }),
    [savedIds, isSaved, add, remove, toggle, syncing, profileId],
  );

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) throw new Error('useMyList must be used inside <MyListProvider>');
  return ctx;
}
