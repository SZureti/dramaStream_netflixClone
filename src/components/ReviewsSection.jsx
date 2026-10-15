import { useId, useState } from 'react';
import { RATINGS, ratingLabel, useReviews } from '../state/ReviewsContext.jsx';
import ThumbsRating from './ThumbsRating.jsx';
import { TrashIcon } from './Icons.jsx';

const MIN_LENGTH = 10;
const MAX_LENGTH = 600;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/** Your rating (Netflix's three options), a review form, and your reviews. */
export default function ReviewsSection({ title }) {
  const { summary, rate, addReview, removeReview, inAccount } = useReviews();
  const { myRating, reviews, counts, count } = summary(title.id);

  const [name, setName] = useState('');
  const [rating, setRating] = useState(myRating);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ids = { name: useId(), text: useId(), err: useId(), count: useId() };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Choose a rating before posting.');
    if (text.trim().length < MIN_LENGTH) return setError(`Write at least ${MIN_LENGTH} characters.`);
    setBusy(true);
    const ok = await addReview(title.id, { name, rating, text });
    setBusy(false);
    if (ok) {
      setText('');
      setError('');
    }
  };

  return (
    <section className="reviews" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="section-title">
        Ratings &amp; Reviews
      </h2>

      <div className="reviews__grid">
        <div className="reviews__summary">
          <p className="reviews__your">{myRating ? RATINGS.find((r) => r.value === myRating).mine : 'Not rated yet'}</p>
          <ThumbsRating
            value={myRating}
            label={`Your rating for ${title.title}`}
            onChange={(v) => {
              rate(title.id, v);
              setRating(v);
            }}
          />
          {count > 0 && (
            <ul className="reviews__breakdown" aria-label="Your reviews by rating">
              {RATINGS.map((r) => (
                <li key={r.value}>
                  {r.label}: {counts[r.value]}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="review-form" onSubmit={submit} noValidate>
          <h3 className="review-form__title">Write a review</h3>
          <ThumbsRating value={rating} onChange={setRating} label="Rating for this review" />

          {!inAccount && (
            <>
              <label htmlFor={ids.name} className="field-label">
                Display name <span className="field-optional">(optional)</span>
              </label>
              <input
                id={ids.name}
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Anonymous viewer"
                autoComplete="off"
              />
            </>
          )}

          <label htmlFor={ids.text} className="field-label">
            Your review
          </label>
          <textarea
            id={ids.text}
            className="field field--area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder={`What did you think of ${title.title}?`}
            aria-describedby={`${ids.count}${error ? ` ${ids.err}` : ''}`}
            aria-invalid={Boolean(error) || undefined}
          />
          <p id={ids.count} className="field-hint">
            {text.length}/{MAX_LENGTH} ·{' '}
            {inAccount ? 'Saved to this profile. Only you can see it.' : 'Saved in this browser only.'}
          </p>
          {error && (
            <p id={ids.err} className="field-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary" disabled={busy}>
            Post Review
          </button>
        </form>
      </div>

      {reviews.length > 0 ? (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id} className="review">
              <div className="review__head">
                <span className="review__avatar" aria-hidden="true">
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="review__name">{r.name}</p>
                  <p className="review__meta">
                    <span className={`review__rating review__rating--${r.rating}`}>{ratingLabel(r.rating)}</span> ·{' '}
                    <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                  </p>
                </div>
                <button
                  type="button"
                  className="review__delete"
                  onClick={() => removeReview(title.id, r.id)}
                  aria-label={`Delete review by ${r.name}`}
                  title="Delete review"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
              <p className="review__text">{r.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="reviews__none">No reviews yet for {title.title}.</p>
      )}
    </section>
  );
}
