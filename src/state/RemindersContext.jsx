import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { supabase } from '../lib/supabase.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';
import { useProfiles } from './ProfileContext.jsx';
import { useStatus } from './StatusContext.jsx';

const RemindersContext = createContext(null);
const GUEST_KEY = 'dramastream:reminders:v1';

const readGuest = () => {
  const ids = readJSON(GUEST_KEY, []);
  return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
};

/**
 * "Remind Me" on Coming Soon titles. Signed out, reminders live in this
 * browser; signed in, they belong to the profile (table reminders). When a
 * reminded title arrives, the notifications bell says so.
 */
export function RemindersProvider({ children }) {
  const { current } = useProfiles();
  const { announce } = useStatus();
  const [ids, setIds] = useState(readGuest);
  const profileId = current?.id ?? null;
  const profileRef = useRef(profileId);
  profileRef.current = profileId;

  useEffect(() => {
    if (!profileId || !supabase) {
      setIds(readGuest());
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('reminders').select('title_id').eq('profile_id', profileId);
      if (cancelled || error) return;
      const account = data.map((r) => r.title_id);
      const guest = readGuest().filter((id) => !account.includes(id) && getTitleById(id));
      if (guest.length) {
        const { error: mergeError } = await supabase.from('reminders').upsert(
          guest.map((title_id) => ({ profile_id: profileId, title_id })),
          { onConflict: 'profile_id,title_id', ignoreDuplicates: true },
        );
        if (!mergeError) removeKey(GUEST_KEY);
      } else {
        removeKey(GUEST_KEY);
      }
      if (!cancelled) setIds([...guest, ...account]);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId) writeJSON(GUEST_KEY, ids);
  }, [ids, profileId]);

  const toggle = useCallback(
    async (titleId) => {
      const title = getTitleById(titleId);
      const on = !ids.includes(titleId);
      setIds((cur) => (on ? [...cur, titleId] : cur.filter((x) => x !== titleId)));
      announce(on ? `We’ll remind you when “${title?.title}” arrives` : `Reminder removed for “${title?.title}”`);
      if (!profileRef.current || !supabase) return;
      const { error } = on
        ? await supabase.from('reminders').upsert({ profile_id: profileRef.current, title_id: titleId })
        : await supabase.from('reminders').delete().eq('profile_id', profileRef.current).eq('title_id', titleId);
      if (error) {
        setIds((cur) => (on ? cur.filter((x) => x !== titleId) : [...cur, titleId]));
        announce('Couldn’t save that reminder. Try again.');
      }
    },
    [ids, announce],
  );

  const value = useMemo(
    () => ({ reminderIds: ids, isReminded: (id) => ids.includes(id), toggleReminder: toggle }),
    [ids, toggle],
  );
  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used inside <RemindersProvider>');
  return ctx;
}
