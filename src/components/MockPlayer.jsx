import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlayable } from '../data/catalog.js';
import SmartImage from './SmartImage.jsx';
import { ArrowLeftIcon, Back10Icon, Forward10Icon, PauseIcon, PlayIcon, ReplayIcon } from './Icons.jsx';

const TICK_MS = 250;
const IDLE_MS = 3000;
const SKIP_SECONDS = 10;

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

function spokenTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (sec || !parts.length) parts.push(`${sec} second${sec === 1 ? '' : 's'}`);
  return parts.join(' ');
}

/**
 * Simulated playback. Nothing streams: the "video" is the title's still artwork
 * and the clock is plain UI state that stops at the title's real duration.
 */
export default function MockPlayer({ title, onBack }) {
  const playable = getPlayable(title);
  const duration = playable.durationSeconds;

  const [isPlaying, setIsPlaying] = useState(false); // never autoplay on entry
  const [currentTime, setCurrentTime] = useState(0);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(null);
  const ended = currentTime >= duration;

  // Advance the simulated clock in real time while "playing".
  useEffect(() => {
    if (!isPlaying) return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;
      setCurrentTime((t) => Math.min(duration, t + delta));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  // Stop exactly at the end — never roll into another title.
  useEffect(() => {
    if (ended && isPlaying) setIsPlaying(false);
  }, [ended, isPlaying]);

  const togglePlay = useCallback(() => {
    if (ended) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [ended]);

  const seekTo = useCallback((t) => setCurrentTime(Math.min(duration, Math.max(0, t))), [duration]);
  const skip = useCallback((d) => setCurrentTime((t) => Math.min(duration, Math.max(0, t + d))), [duration]);

  // Auto-hide the controls while playing; any activity brings them back.
  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  useEffect(() => {
    wake();
    return () => clearTimeout(idleTimer.current);
  }, [wake, isPlaying]);

  // Keyboard shortcuts that don't fight native control behavior.
  useEffect(() => {
    const onKey = (e) => {
      wake();
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = e.target?.tagName;
      const onControl = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT';
      if ((e.key === ' ' || e.key === 'k' || e.key === 'K') && !onControl) {
        e.preventDefault();
        togglePlay();
      } else if ((e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') && tag !== 'INPUT') {
        e.preventDefault();
        skip(-SKIP_SECONDS);
      } else if ((e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') && tag !== 'INPUT') {
        e.preventDefault();
        skip(SKIP_SECONDS);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, wake]);

  const atStart = currentTime <= 0;
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const playLabel = ended ? 'Replay' : isPlaying ? 'Pause' : 'Play';
  const stateText = ended ? 'Ended' : isPlaying ? 'Playing' : 'Paused';

  return (
    <div
      className={`player${isPlaying ? ' player--playing' : ''}${idle && isPlaying ? ' player--idle' : ''}`}
      onPointerMove={wake}
      onPointerDown={wake}
    >
      <div className="player__stage" onClick={togglePlay} aria-hidden="true">
        <SmartImage
          src={title.heroSrc}
          alt=""
          fallbackText={title.title}
          className="player__art"
          style={{ objectPosition: title.heroPosition }}
        />
        <div className="player__scrim" />
        <div className={`player__center${isPlaying ? '' : ' player__center--show'}`}>
          {ended ? <ReplayIcon size={56} /> : <PlayIcon size={56} />}
        </div>
      </div>

      <p className="player__mock-label">
        <span className="player__mock-dot" aria-hidden="true" />
        Mock player — no video is streaming
      </p>

      <div className="player__chrome">
        <div className="player__top">
          <button type="button" className="player__back" onClick={onBack}>
            <ArrowLeftIcon size={26} />
            <span>Back to Details</span>
          </button>
        </div>

        <div className="player__bottom">
          <h1 className="player__title">
            {title.title}
            {playable.label && (
              <span className="player__episode">
                {playable.label} {playable.subtitle}
              </span>
            )}
          </h1>

          <div className="player__seek-row">
            <label htmlFor="player-seek" className="player__seek-label">
              Seek
            </label>
            <input
              id="player-seek"
              type="range"
              className="player__seek"
              min="0"
              max={duration}
              step="1"
              value={Math.floor(currentTime)}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-valuetext={`${spokenTime(currentTime)} of ${spokenTime(duration)}`}
              style={{ '--progress': `${progress}%` }}
            />
            {/* Plain text, not <output>: a live region here would announce every second. */}
            <span className="player__time">
              {formatClock(currentTime)} <span aria-hidden="true">/</span>
              <span className="sr-only"> of </span> {formatClock(duration)}
            </span>
          </div>

          <div className="player__controls">
            <button type="button" className="player__btn player__btn--main" onClick={togglePlay}>
              {ended ? <ReplayIcon size={30} /> : isPlaying ? <PauseIcon size={30} /> : <PlayIcon size={30} />}
              <span className="player__btn-text">{playLabel}</span>
            </button>
            {/* aria-disabled (not disabled) so a focused button keeps keyboard focus at the bounds. */}
            <button
              type="button"
              className="player__btn"
              onClick={() => skip(-SKIP_SECONDS)}
              aria-disabled={atStart}
              aria-label="Back 10 seconds"
            >
              <Back10Icon size={30} />
              <span className="player__btn-text" aria-hidden="true">
                −10s
              </span>
            </button>
            <button
              type="button"
              className="player__btn"
              onClick={() => skip(SKIP_SECONDS)}
              aria-disabled={ended}
              aria-label="Forward 10 seconds"
            >
              <Forward10Icon size={30} />
              <span className="player__btn-text" aria-hidden="true">
                +10s
              </span>
            </button>

            <p className={`player__state player__state--${stateText.toLowerCase()}`} aria-live="polite">
              <span className="player__state-dot" aria-hidden="true" />
              {stateText} <span className="player__state-sim">(simulated)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
