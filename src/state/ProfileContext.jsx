import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';
import { setMaturityLimit } from '../data/catalog.js';
import { useAuth } from './AuthContext.jsx';
import { useStatus } from './StatusContext.jsx';

const ProfileContext = createContext(null);

export const MAX_PROFILES = 5;
export const AVATARS = ['red', 'blue', 'green', 'yellow', 'purple', 'teal'];
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
];
export const SUBTITLE_SIZES = ['small', 'medium', 'large'];
export const SUBTITLE_STYLES = [
  { value: 'white', label: 'White text with shadow' },
  { value: 'yellow', label: 'Yellow text with shadow' },
  { value: 'boxed', label: 'White text on a black box' },
];
export const MATURITY_LEVELS = [
  { value: 'little-kids', label: 'Little Kids', ratings: 'TV-Y, G, TV-G' },
  { value: 'older-kids', label: 'Older Kids', ratings: 'TV-Y7, PG, TV-PG' },
  { value: 'teens', label: 'Teens', ratings: 'PG-13, TV-14' },
  { value: 'all', label: 'All Maturity Ratings', ratings: 'R, TV-MA, NR' },
];

const selectedKey = (userId) => `dramastream:profile:${userId}`;

function friendly(error) {
  const msg = error?.message ?? '';
  if (/at most 5 profiles/i.test(msg)) return `An account can have up to ${MAX_PROFILES} profiles.`;
  if (/duplicate key|profiles_user_id_name_key/i.test(msg)) return 'You already have a profile with that name.';
  return msg || 'Something went wrong. Please try again.';
}

/**
 * Netflix-style profiles for signed-in accounts (Supabase table profiles).
 * Signed-out visitors have no profiles: their data stays in the browser.
 * The chosen profile is remembered per account in this browser.
 */
export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const { announce } = useStatus();
  const userId = user?.id ?? null;
  const [profiles, setProfiles] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loaded, setLoaded] = useState(!userId);

  useEffect(() => {
    if (!userId || !supabase) {
      setProfiles([]);
      setCurrentId(null);
      setLoaded(true);
      return undefined;
    }
    let cancelled = false;
    setLoaded(false);
    (async () => {
      let { data, error } = await supabase.from('profiles').select('*').order('created_at');
      if (cancelled) return;
      if (!error && data.length === 0) {
        // A new account gets one profile named after the email, like Netflix does.
        const name = (user.email?.split('@')[0] || 'Me').slice(0, 30);
        const created = await supabase.from('profiles').insert({ name }).select('*');
        data = created.data ?? [];
        error = created.error;
      }
      if (cancelled) return;
      if (error) {
        announce('Couldn’t load your profiles.');
        setProfiles([]);
      } else {
        setProfiles(data);
        const remembered = readJSON(selectedKey(userId), null);
        setCurrentId(data.some((p) => p.id === remembered) ? remembered : null);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, user?.email, announce]);

  const current = profiles.find((p) => p.id === currentId) ?? null;

  // Kids profiles (and lower maturity settings) only see titles they're allowed.
  useEffect(() => {
    setMaturityLimit(current?.max_maturity ?? 'all');
  }, [current?.max_maturity]);

  const selectProfile = useCallback(
    (id) => {
      setCurrentId(id);
      if (userId) {
        if (id) writeJSON(selectedKey(userId), id);
        else removeKey(selectedKey(userId));
      }
    },
    [userId],
  );

  const createProfile = useCallback(async (fields) => {
    const { data, error } = await supabase.from('profiles').insert(fields).select('*').single();
    if (error) return { error: friendly(error) };
    setProfiles((list) => [...list, data]);
    return { error: null, profile: data };
  }, []);

  const updateProfile = useCallback(async (id, fields) => {
    const { data, error } = await supabase.from('profiles').update(fields).eq('id', id).select('*').single();
    if (error) return { error: friendly(error) };
    setProfiles((list) => list.map((p) => (p.id === id ? data : p)));
    return { error: null, profile: data };
  }, []);

  const deleteProfile = useCallback(
    async (id) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) return { error: friendly(error) };
      setProfiles((list) => list.filter((p) => p.id !== id));
      if (id === currentId) selectProfile(null);
      return { error: null };
    },
    [currentId, selectProfile],
  );

  const value = useMemo(
    () => ({
      loaded,
      profiles,
      current,
      needsChoice: Boolean(userId) && loaded && !current && profiles.length > 0,
      selectProfile,
      createProfile,
      updateProfile,
      deleteProfile,
    }),
    [loaded, profiles, current, userId, selectProfile, createProfile, updateProfile, deleteProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used inside <ProfileProvider>');
  return ctx;
}
