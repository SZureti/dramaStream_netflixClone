import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import AuthField from '../components/AuthField.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { MIN_PASSWORD, passwordError } from '../lib/validate.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

/** Where the password-reset email lands. Also used to change a password while signed in. */
export default function ResetPasswordPage() {
  useDocumentTitle('Choose a New Password');
  const { ready, user, updatePassword } = useAuth();
  const { announce } = useStatus();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <AuthShell title="Choose a new password">
        <p role="status">Checking your link…</p>
      </AuthShell>
    );
  }

  // The reset link signs the viewer in for this one purpose. Without it, there's nothing to change.
  if (!user) {
    return (
      <AuthShell title="Link expired">
        <p>This password link has expired or was already used.</p>
        <Link to="/forgot-password" className="btn auth-form__submit">
          Send a New Link
        </Link>
      </AuthShell>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = passwordError(password);
    setError(found);
    setFormError(null);
    if (found) return;
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    announce('Password updated');
    navigate('/account', { replace: true });
  }

  return (
    <AuthShell title="Choose a new password">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="auth-form__error" role="alert">
            {formError}
          </p>
        )}
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          hint={`At least ${MIN_PASSWORD} characters.`}
        />
        <button type="submit" className="btn auth-form__submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save Password'}
        </button>
      </form>
    </AuthShell>
  );
}
