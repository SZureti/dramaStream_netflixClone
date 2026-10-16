import { useEffect, useId, useRef, useState } from 'react';
import { SubtitlesIcon } from './Icons.jsx';

export const AUDIO_TRACKS = [
  { value: 'original', label: 'English [Original]' },
  { value: 'ad', label: 'English – Audio Description' },
];
export const SUBTITLE_TRACKS = [
  { value: 'off', label: 'Off' },
  { value: 'en', label: 'English' },
  { value: 'en-cc', label: 'English (CC)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
];

/** The player's Audio & Subtitles panel (mock tracks: nothing actually plays). */
export default function AudioSubtitlesMenu({ audio, subtitles, onAudio, onSubtitles }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <div className="av-menu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="player__btn"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Audio and subtitles"
        onClick={() => setOpen((o) => !o)}
      >
        <SubtitlesIcon size={28} />
      </button>
      <div id={panelId} className="av-menu__panel" hidden={!open}>
        <fieldset className="av-menu__group">
          <legend>Audio</legend>
          {AUDIO_TRACKS.map((t) => (
            <label key={t.value} className="av-menu__option">
              <input type="radio" name="audio-track" checked={audio === t.value} onChange={() => onAudio(t.value)} />
              <span>{t.label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="av-menu__group">
          <legend>Subtitles</legend>
          {SUBTITLE_TRACKS.map((t) => (
            <label key={t.value} className="av-menu__option">
              <input
                type="radio"
                name="subtitle-track"
                checked={subtitles === t.value}
                onChange={() => onSubtitles(t.value)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </fieldset>
        <p className="av-menu__note">Mock tracks: no audio or subtitle files exist for this demo.</p>
      </div>
    </div>
  );
}
