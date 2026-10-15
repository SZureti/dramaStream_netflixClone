import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import AuthField from '../components/AuthField.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { emailError } from '../lib/validate.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset Password');
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = emailError(email);
    setError(found);
    setFormError(null);
    if (found) return;
    setBusy(true);
    const result = await sendPasswordReset(email.trim());
    setBusy(false);
    if (result.error) setFormError(result.error);
    else setSent(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      footer={
        <p>
          Remembered it? <Link to="/signin">Sign in</Link>.
        </p>
      }
    >
      {sent ? (
        <p role="status">
          If an account exists for <strong>{email.trim()}</strong>, we’ve emailed a link to choose a new password.
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <p className="auth__lede">Enter your email and we’ll send you a link to choose a new password.</p>
          {formError && (
            <p className="auth-form__error" role="alert">
              {formError}
            </p>
          )}
          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <button type="submit" className="btn auth-form__submit" disabled={busy}>
            {busy ? 'Sending…' : 'Email Me a Link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
