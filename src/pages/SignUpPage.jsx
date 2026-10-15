import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import AuthField from '../components/AuthField.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { MIN_PASSWORD, emailError, passwordError } from '../lib/validate.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function SignUpPage() {
  useDocumentTitle('Sign Up');
  const { user, signUp } = useAuth();
  const { announce } = useStatus();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  if (user && !busy) return <Navigate to="/" replace />;

  if (sentTo) {
    return (
      <AuthShell title="Check your email">
        <div className="auth-form" role="status">
          <p>
            We sent a confirmation link to <strong>{sentTo}</strong>. Open it to finish creating your account,
            then sign in.
          </p>
          <Link to={`/signin?email=${encodeURIComponent(sentTo)}`} className="btn auth-form__submit">
            Go to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = { email: emailError(email), password: passwordError(password) };
    setErrors(found);
    setFormError(null);
    if (found.email || found.password) return;
    setBusy(true);
    const { error, needsConfirmation } = await signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setFormError(error);
      return;
    }
    if (needsConfirmation) {
      setSentTo(email.trim());
      return;
    }
    announce('Account created. You’re signed in.');
    navigate('/', { replace: true });
  }

  return (
    <AuthShell
      title="Sign Up"
      footer={
        <p>
          Already have an account? <Link to="/signin">Sign in</Link>.
        </p>
      }
    >
      <p className="auth__lede">
        An account saves My List and where you left off, on any device. No payment details, ever.
      </p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          error={errors.email}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD} characters.`}
        />
        <button type="submit" className="btn auth-form__submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
}
