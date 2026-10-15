import { useEffect, useId, useRef, useState } from 'react';
import { checkPin, isPin } from '../lib/pin.js';

/** Asks for a locked profile's 4-digit PIN in a native <dialog>. */
export default function PinDialog({ profile, onUnlock, onCancel }) {
  const ref = useRef(null);
  const inputId = useId();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (profile && dialog && !dialog.open) {
      setPin('');
      setError(null);
      dialog.showModal();
    } else if (!profile && dialog?.open) {
      dialog.close();
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isPin(pin)) {
      setError('Enter the 4 digits.');
      return;
    }
    setChecking(true);
    const ok = await checkPin(profile, pin);
    setChecking(false);
    if (ok) onUnlock(profile);
    else {
      setError('That PIN isn’t right. Try again.');
      setPin('');
    }
  }

  return (
    <dialog
      ref={ref}
      className="confirm pin-dialog"
      aria-labelledby={`${inputId}-title`}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      {profile && (
        <form onSubmit={handleSubmit} noValidate>
          <h2 id={`${inputId}-title`} className="confirm__title">
            Profile Lock is on
          </h2>
          <p className="confirm__body">Enter the PIN to watch as {profile.name}.</p>
          <label htmlFor={inputId} className="sr-only">
            4-digit PIN
          </label>
          <input
            id={inputId}
            className="field pin-dialog__input"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            autoFocus
          />
          {error && (
            <p id={`${inputId}-error`} className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="confirm__actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={checking}>
              Unlock
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
