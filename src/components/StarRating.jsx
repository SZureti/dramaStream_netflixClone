import { useId, useState } from 'react';
import { StarIcon } from './Icons.jsx';

/**
 * Accessible 1–5 star input: a radio group, so arrow keys work and screen
 * readers hear "3 stars, 3 of 5". Hovering previews the value.
 */
export function StarInput({ value, onChange, legend, size = 30, name }) {
  const autoName = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  return (
    <fieldset className="star-input" onMouseLeave={() => setHover(0)}>
      <legend className="star-input__legend">{legend}</legend>
      <div className="star-input__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`star-input__star${n <= shown ? ' is-on' : ''}`} onMouseEnter={() => setHover(n)}>
            <input
              type="radio"
              className="sr-only"
              name={name ?? autoName}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
            />
            <StarIcon size={size} filled={n <= shown} />
            <span className="sr-only">
              {n} star{n === 1 ? '' : 's'}
            </span>
          </label>
        ))}
        <span className="star-input__value" aria-hidden="true">
          {value ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </fieldset>
  );
}

/** Read-only stars (rounded to the nearest half for display). */
export function StarDisplay({ value, size = 16, className = '' }) {
  const rounded = Math.round((value ?? 0) * 2) / 2;
  return (
    <span className={`star-display ${className}`} role="img" aria-label={`${value?.toFixed(1) ?? 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={size} filled={n <= rounded} half={n - 0.5 === rounded} />
      ))}
    </span>
  );
}
