import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import AuthField from '../components/AuthField.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useStatus } from '../state/StatusContext.jsx';
import { emailError, safeNext } from '../lib/validate.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function SignInPage() {
  useDocumentTitle('Sign In');
  const { user, signIn } = useAuth();
  const { announce } = useStatus();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={next} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    const found = { email: emailError(email), password: password ? null : 'Enter your password.' };
    setErrors(found);
    setFormError(null);
    if (found.email || found.password) return;
    setBusy(true);
    const { error } = await signIn({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setFormError(error);
      return;
    }
    announce('Signed in');
    navigate(next, { replace: true });
  }

  return (
    <AuthShell
      title="Sign In"
      footer={
        <p>
          New to DramaStream?{' '}
          <Link to={`/signup${email ? `?email=${encodeURIComponent(email.trim())}` : ''}`}>Sign up now</Link>.
        </p>
      }
    >
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <button type="submit" className="btn auth-form__submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
        <Link to="/forgot-password" className="auth-form__link">
          Forgot password?
        </Link>
      </form>
    </AuthShell>
  );
}
