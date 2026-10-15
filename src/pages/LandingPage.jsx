import { useId, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/AppHeader.jsx';
import { ChevronRightIcon } from '../components/Icons.jsx';
import { getCatalog } from '../data/catalog.js';
import { useAuth } from '../state/AuthContext.jsx';
import { chooseGuest } from '../lib/guest.js';
import { emailError } from '../lib/validate.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import FaqList from '../components/FaqList.jsx';

function EmailCta({ id }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const errorId = `${id}-error`;

  function handleSubmit(e) {
    e.preventDefault();
    const found = emailError(email);
    setError(found);
    if (!found) navigate(`/signup?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form className="landing-cta" onSubmit={handleSubmit} noValidate>
      <p className="landing-cta__lede">Ready to watch? Enter your email to create your free account.</p>
      <div className="landing-cta__row">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          autoComplete="email"
          className="field landing-cta__input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="submit" className="btn landing-cta__btn">
          Get Started <ChevronRightIcon size={22} />
        </button>
      </div>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

/** The signed-out welcome page, like Netflix's landing page. */
export default function LandingPage() {
  useDocumentTitle('Welcome');
  const { user } = useAuth();
  const heroId = useId();
  const footerId = useId();
  if (user) return <Navigate to="/" replace />;

  const posters = getCatalog();

  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__collage" aria-hidden="true">
          {posters.map((t) => (
            <img key={t.id} src={t.posterSmallSrc} alt="" decoding="async" />
          ))}
        </div>
        <div className="landing-hero__shade" aria-hidden="true" />
        <header className="landing-hero__header">
          <Wordmark />
          <Link to="/signin" className="btn btn--sm landing-hero__signin">
            Sign In
          </Link>
        </header>
        <div className="landing-hero__content">
          <h1 id="landing-title" className="landing-hero__title">
            Unlimited drama. Films, series and documentaries.
          </h1>
          <p className="landing-hero__sub">Free to browse. Sign in to save your list and pick up where you left off.</p>
          <EmailCta id={heroId} />
          <Link to="/" className="landing-hero__guest" onClick={chooseGuest}>
            Browse without signing in
          </Link>
        </div>
      </section>

      <section className="landing-features" aria-label="What you get">
        <div className="landing-feature">
          <h2>Save titles to My List</h2>
          <p>Signed in, your list follows you from your laptop to your phone.</p>
        </div>
        <div className="landing-feature">
          <h2>Pick up where you left off</h2>
          <p>Continue Watching remembers how far you got in every film and episode.</p>
        </div>
        <div className="landing-feature">
          <h2>Rate and review</h2>
          <p>Give titles stars, write reviews, and share what you love.</p>
        </div>
      </section>

      <section className="landing-faq" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="landing-faq__title">
          Frequently Asked Questions
        </h2>
        <FaqList />
        <EmailCta id={footerId} />
      </section>
    </div>
  );
}
