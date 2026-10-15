import { DoubleThumbIcon, ThumbDownIcon, ThumbUpIcon } from './Icons.jsx';
import { RATINGS } from '../state/ReviewsContext.jsx';

const ICONS = { 'not-for-me': ThumbDownIcon, like: ThumbUpIcon, love: DoubleThumbIcon };

/**
 * Netflix's three ratings as toggle buttons (aria-pressed). Choosing the
 * current rating again clears it. `compact` shows icons only (labels stay
 * available to screen readers and as tooltips).
 */
export default function ThumbsRating({ value, onChange, label = 'Rate this title', compact = false, size = 22 }) {
  return (
    <div className={`thumbs${compact ? ' thumbs--compact' : ''}`} role="group" aria-label={label}>
      {RATINGS.map((r) => {
        const Icon = ICONS[r.value];
        const pressed = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            className={`thumbs__btn${pressed ? ' thumbs__btn--on' : ''}`}
            aria-pressed={pressed}
            title={r.label}
            onClick={() => onChange(pressed ? null : r.value)}
          >
            <Icon size={size} />
            <span className={compact ? 'sr-only' : 'thumbs__label'}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
