import { Link } from 'react-router-dom';
import { Wordmark } from './AppHeader.jsx';
import { chooseGuest } from '../lib/guest.js';

/**
 * Layout for the signed-out screens (sign in, sign up, password reset): the
 * wordmark over a dimmed still, with the form in a centered panel.
 */
export default function AuthShell({ title, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__backdrop" aria-hidden="true" />
      <header className="auth__header">
        <Wordmark />
      </header>
      <div className="auth__panel">
        <h1 className="auth__title">{title}</h1>
        {children}
        {footer && <div className="auth__footer">{footer}</div>}
      </div>
      <p className="auth__guest">
        <Link to="/" className="auth__guest-link" onClick={chooseGuest}>
          Browse without signing in
        </Link>
      </p>
    </div>
  );
}
