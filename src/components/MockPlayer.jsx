import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlayable } from '../data/catalog.js';
import SmartImage from './SmartImage.jsx';
import {
  ArrowLeftIcon,
  Back10Icon,
  ExitFullscreenIcon,
  Forward10Icon,
  FullscreenIcon,
  MuteIcon,
  NextEpisodeIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  VolumeIcon,
} from './Icons.jsx';

const TICK_MS = 250;
const IDLE_MS = 3000;
const SKIP_SECONDS = 10;
const SAVE_EVERY_MS = 5000;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const NEXT_COUNTDOWN = 10; // seconds before the next episode starts on its own
// A pretend title sequence for series episodes, so Skip Intro has something to skip.
const INTRO = { start: 5, end: 75 };

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
export default function MockPlayer({
  title,
  episode,
  onBack,
  initialTime = 0,
  onProgress,
  nextEpisode = null,
  onNext,
  autoplayNext = true,
  autoStart = false, // true when the previous episode rolled into this one
}) {
  const playable = getPlayable(title, episode ?? undefined);
  const duration = playable.durationSeconds;
  const playerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(autoStart); // never autoplay on a fresh visit
  const [currentTime, setCurrentTime] = useState(() => Math.min(initialTime, duration));
  const [idle, setIdle] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(null); // seconds left before the next episode
  const idleTimer = useRef(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const soundRef = useRef({ volume, muted }); // latest values for the keyboard handler
  soundRef.current = { volume, muted };
  const ended = currentTime >= duration;
  const inIntro = Boolean(playable.episode) && currentTime >= INTRO.start && currentTime < INTRO.end;

  // Advance the simulated clock in real time while "playing".
  useEffect(() => {
    if (!isPlaying) return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = ((now - last) / 1000) * speedRef.current;
      last = now;
      setCurrentTime((t) => Math.min(duration, t + delta));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  // Report the position every few seconds while playing, on pause, and when
  // leaving, so Continue Watching can resume here. Refs keep the latest values
  // without restarting the timers.
  const timeRef = useRef(currentTime);
  timeRef.current = currentTime;
  const reportRef = useRef(onProgress);
  reportRef.current = onProgress;
  const report = useCallback(() => reportRef.current?.(timeRef.current, duration), [duration]);
  const touched = useRef(false); // don't save a visit where nothing was played or sought

  useEffect(() => {
    if (!isPlaying) return undefined;
    touched.current = true;
    const id = setInterval(report, SAVE_EVERY_MS);
    return () => {
      clearInterval(id);
      report(); // paused (or ended)
    };
  }, [isPlaying, report]);

  useEffect(
    () => () => {
      if (touched.current) report();
    },
    [report],
  );

  // Stop exactly at the end — never roll into another title. A series may roll
  // into its next episode after a visible countdown, if the profile allows it.
  useEffect(() => {
    if (ended && isPlaying) {
      setIsPlaying(false);
      if (nextEpisode && autoplayNext) setCountdown(NEXT_COUNTDOWN);
    }
  }, [ended, isPlaying, nextEpisode, autoplayNext]);

  useEffect(() => {
    if (countdown === null) return undefined;
    if (countdown <= 0) {
      onNext?.();
      return undefined;
    }
    const id = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(id);
  }, [countdown, onNext]);

  // Fullscreen follows the browser (Esc or the system UI can leave it too).
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else playerRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  const changeVolume = useCallback((v) => {
    const next = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
    setVolume(next);
    setMuted(next === 0);
  }, []);

  const togglePlay = useCallback(() => {
    setCountdown(null);
    if (ended) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [ended]);

  const seekTo = useCallback(
    (t) => {
      touched.current = true;
      setCurrentTime(Math.min(duration, Math.max(0, t)));
    },
    [duration],
  );
  const skip = useCallback(
    (d) => {
      touched.current = true;
      setCurrentTime((t) => Math.min(duration, Math.max(0, t + d)));
    },
    [duration],
  );

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
      } else if ((e.key === 'f' || e.key === 'F') && tag !== 'INPUT' && tag !== 'SELECT') {
        e.preventDefault();
        toggleFullscreen();
      } else if ((e.key === 'm' || e.key === 'M') && tag !== 'INPUT' && tag !== 'SELECT') {
        e.preventDefault();
        soundRef.current = { ...soundRef.current, muted: !soundRef.current.muted };
        setMuted(soundRef.current.muted);
      } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && tag !== 'INPUT' && tag !== 'SELECT') {
        e.preventDefault();
        const { volume: v, muted: m } = soundRef.current;
        const next = Math.min(1, Math.max(0, (m ? 0 : v) + (e.key === 'ArrowUp' ? 0.1 : -0.1)));
        soundRef.current = { volume: next, muted: next === 0 };
        changeVolume(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, wake, toggleFullscreen, changeVolume]);

  const atStart = currentTime <= 0;
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const playLabel = ended ? 'Replay' : isPlaying ? 'Pause' : 'Play';
  const stateText = ended ? 'Ended' : isPlaying ? 'Playing' : 'Paused';

  return (
    <div
      ref={playerRef}
      className={`player${isPlaying ? ' player--playing' : ''}${idle && isPlaying ? ' player--idle' : ''}`}
      onPointerMove={wake}
      onPointerDown={wake}
    >
      <div className="player__stage" onClick={togglePlay} aria-hidden="true">
        <SmartImage
          src={title.heroSrc}
          srcSet={title.heroSrcSet}
          sizes="100vw"
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

      {inIntro && (
        <button type="button" className="player__skip-intro" onClick={() => seekTo(INTRO.end)}>
          Skip Intro
        </button>
      )}

      {countdown !== null && nextEpisode && (
        <div className="player__next" role="status">
          <p className="player__next-label">
            Next episode in {countdown}
            <span className="player__next-title">
              S{nextEpisode.season}:E{nextEpisode.episode} “{nextEpisode.title}”
            </span>
          </p>
          <div className="player__next-actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => onNext?.()}>
              Play Now
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setCountdown(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

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

            <div className="player__volume">
              <button
                type="button"
                className="player__btn"
                onClick={() => setMuted((m) => !m)}
                aria-pressed={muted}
                aria-label={muted ? 'Unmute (simulated)' : 'Mute (simulated)'}
              >
                {muted || volume === 0 ? <MuteIcon size={28} /> : <VolumeIcon size={28} />}
              </button>
              <label htmlFor="player-volume" className="sr-only">
                Volume (simulated)
              </label>
              <input
                id="player-volume"
                type="range"
                className="player__volume-range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
              />
            </div>

            <label className="player__speed">
              <span className="sr-only">Playback speed</span>
              <select className="player__speed-select" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s === 1 ? 'Normal speed' : `${s}×`}
                  </option>
                ))}
              </select>
            </label>

            {nextEpisode && (
              <button type="button" className="player__btn player__btn--text" onClick={() => onNext?.()}>
                <NextEpisodeIcon size={26} />
                <span>Next Episode</span>
              </button>
            )}

            <button
              type="button"
              className="player__btn"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {fullscreen ? <ExitFullscreenIcon size={28} /> : <FullscreenIcon size={28} />}
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
