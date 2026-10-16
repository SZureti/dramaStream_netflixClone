import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { supabase } from '../lib/supabase.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';
import { useProfiles } from './ProfileContext.jsx';
import { useStatus } from './StatusContext.jsx';

const ProgressContext = createContext(null);
const GUEST_KEY = 'dramastream:progress:v1';

/** Past this share of the running time, a title counts as finished. */
export const FINISHED_AT = 0.95;
/** Less than this many seconds in, there's nothing worth resuming. */
const MIN_RESUME_SECONDS = 10;

const readGuest = () => {
  const data = readJSON(GUEST_KEY, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
};

function fromRow(r) {
  return {
    position: r.position_seconds,
    duration: r.duration_seconds,
    season: r.season_number,
    episode: r.episode_number,
    hidden: r.hidden,
    updatedAt: r.updated_at,
  };
}

function toRow(profileId, titleId, p) {
  return {
    profile_id: profileId,
    title_id: titleId,
    position_seconds: Math.round(Math.min(p.position, p.duration)),
    duration_seconds: Math.round(p.duration),
    season_number: p.season ?? null,
    episode_number: p.episode ?? null,
    hidden: Boolean(p.hidden),
    updated_at: p.updatedAt,
  };
}

/** True when there's a place worth resuming from. */
export function isResumable(p) {
  return Boolean(p && p.position >= MIN_RESUME_SECONDS && p.position < p.duration * FINISHED_AT);
}

/**
 * How far the viewer got in each title (the mock player's clock). Signed out,
 * it lives in this browser; signed in, it belongs to the chosen profile in
 * Supabase (viewing_progress), merged from the browser the first time.
 */
export function ProgressProvider({ children }) {
  const { current } = useProfiles();
  const { announce } = useStatus();
  const [byTitle, setByTitle] = useState(readGuest);
  const profileId = current?.id ?? null;
  const profileRef = useRef(profileId);
  profileRef.current = profileId;
  const latest = useRef(byTitle);
  latest.current = byTitle;

  useEffect(() => {
    if (!profileId || !supabase) {
      setByTitle(readGuest());
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('viewing_progress')
        .select('title_id, position_seconds, duration_seconds, season_number, episode_number, hidden, updated_at')
        .eq('profile_id', profileId);
      if (cancelled) return;
      if (error) {
        announce('Couldn’t load Continue Watching from your account.');
        return;
      }
      const account = Object.fromEntries(data.map((r) => [r.title_id, fromRow(r)]));
      // Bring over browser progress that's newer than (or missing from) the account.
      const guest = readGuest();
      const newer = Object.entries(guest).filter(
        ([id, p]) => getTitleById(id) && (!account[id] || p.updatedAt > account[id].updatedAt),
      );
      if (newer.length) {
        const { error: mergeError } = await supabase.from('viewing_progress').upsert(
          newer.map(([id, p]) => toRow(profileId, id, p)),
          { onConflict: 'profile_id,title_id' },
        );
        if (!mergeError) {
          newer.forEach(([id, p]) => {
            account[id] = p;
          });
          removeKey(GUEST_KEY);
        }
      } else {
        removeKey(GUEST_KEY);
      }
      if (!cancelled) setByTitle(account);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, announce]);

  useEffect(() => {
    if (!profileId) writeJSON(GUEST_KEY, byTitle);
  }, [byTitle, profileId]);

  const write = useCallback(async (titleId, entry) => {
    if (!profileRef.current || !supabase) return;
    const { error } = await supabase
      .from('viewing_progress')
      .upsert(toRow(profileRef.current, titleId, entry), { onConflict: 'profile_id,title_id' });
    if (error && import.meta.env.DEV) console.warn('[progress] save failed:', error.message);
  }, []);

  /** Called by the player every few seconds, on pause, and when leaving. */
  const saveProgress = useCallback(
    (titleId, { position, duration, season = null, episode = null }) => {
      if (!duration || !getTitleById(titleId)) return;
      const entry = {
        position: Math.max(0, Math.min(position, duration)),
        duration,
        season,
        episode,
        hidden: false,
        updatedAt: new Date().toISOString(),
      };
      setByTitle((cur) => ({ ...cur, [titleId]: entry }));
      write(titleId, entry);
    },
    [write],
  );

  /** "Remove from row" on a Continue Watching card. */
  const hideFromRow = useCallback(
    (titleId) => {
      const existing = latest.current[titleId];
      if (!existing) return;
      const entry = { ...existing, hidden: true };
      setByTitle((cur) => ({ ...cur, [titleId]: entry }));
      const title = getTitleById(titleId);
      if (title) announce(`Removed “${title.title}” from Continue Watching`);
      write(titleId, entry);
    },
    [announce, write],
  );

  const value = useMemo(() => {
    const continueWatching = Object.entries(byTitle)
      .filter(([id, p]) => !p.hidden && isResumable(p) && getTitleById(id))
      .sort(([, a], [, b]) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map(([id, p]) => ({ title: getTitleById(id), progress: p }));
    // Everything played, newest first (Viewing activity), including hidden and finished titles.
    const history = Object.entries(byTitle)
      .map(([titleId, p]) => ({ titleId, ...p }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return {
      history,
      getProgress: (titleId) => byTitle[titleId] ?? null,
      saveProgress,
      hideFromRow,
      continueWatching,
    };
  }, [byTitle, saveProgress, hideFromRow]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
